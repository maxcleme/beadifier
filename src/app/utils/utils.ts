import { Palette, PaletteEntry } from "../model/palette/palette.model";
import { Color } from "../model/color/color.model";

import * as _ from 'lodash';
import { Matching } from '../model/matching/matching.model';
import { Project } from '../model/project/project.model';

export class ImagePosition {
    xStart: number;
    yStart: number;
    width: number;
    height: number;
    constructor(xStart: number, yStart: number, width: number, height: number) {
        this.xStart = xStart;
        this.yStart = yStart;
        this.width = width;
        this.height = height;
    }

    contains(x: number, y: number): boolean {
        if (x < this.xStart || x >= this.xStart + this.width) {
            return false;
        }
        if (y < this.yStart || y >= this.yStart + this.height) {
            return false;
        }
        return true;
    }
}

export function drawImageInsideCanvas(canvas, image, centered): ImagePosition {
    /**
     * Credit to : https://sdqali.in/blog/2013/10/03/fitting-an-image-in-to-a-canvas-object/
     */

    var imageAspectRatio = image.width / image.height;
    var canvasAspectRatio = canvas.width / canvas.height;
    var renderableHeight, renderableWidth, xStart, yStart;

    // If image's aspect ratio is less than canvas's we fit on height
    // and place the image centrally along width
    if (imageAspectRatio < canvasAspectRatio) {
        renderableHeight = canvas.height;
        renderableWidth = image.width * (renderableHeight / image.height);
        xStart = centered ? (canvas.width - renderableWidth) / 2 : 0;
        yStart = 0;
    }

    // If image's aspect ratio is greater than canvas's we fit on width
    // and place the image centrally along height
    else if (imageAspectRatio > canvasAspectRatio) {
        renderableWidth = canvas.width
        renderableHeight = image.height * (renderableWidth / image.width);
        xStart = 0;
        yStart = centered ? (canvas.height - renderableHeight) / 2 : 0;
    }

    // Happy path - keep aspect ratio
    else {
        renderableHeight = canvas.height;
        renderableWidth = canvas.width;
        xStart = 0;
        yStart = 0;
    }

    let rxStart = Math.floor(xStart);
    let ryStart = Math.floor(yStart);
    let rrenderableWidth = Math.floor(renderableWidth);
    let rrenderableHeight = Math.floor(renderableHeight);

    canvas.getContext('2d').filter = image.style.filter;
    canvas.getContext('2d').drawImage(image, rxStart, ryStart, rrenderableWidth, rrenderableHeight);
    return new ImagePosition(rxStart, ryStart, rrenderableWidth, rrenderableHeight)
}

export function reduceColor(canvas: HTMLCanvasElement, project: Project, drawingPosition: ImagePosition): ImageData {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let color = get(imageData, canvas, x, y);
            if (color.a !== 0) {
                const closestPaletteEntry = getClosestPaletteEntry(project.paletteConfiguration.palettes, color, project.matchingConfiguration.matching);
                set(imageData, canvas, x, y, closestPaletteEntry.color)

                if (project.ditheringConfiguration.enable) {
                    const quantError = color.sub(closestPaletteEntry.color);

                    if (drawingPosition.contains(x + 1, y)) {
                        set(imageData, canvas, x + 1, y, get(imageData, canvas, x + 1, y).add(quantError.mult(project.ditheringConfiguration.hardness * 7 / 16)))
                    }
                    if (drawingPosition.contains(x - 1, y + 1)) {
                        set(imageData, canvas, x - 1, y + 1, get(imageData, canvas, x - 1, y + 1).add(quantError.mult(project.ditheringConfiguration.hardness * 3 / 16)))
                    }
                    if (drawingPosition.contains(x, y + 1)) {
                        set(imageData, canvas, x, y + 1, get(imageData, canvas, x, y + 1).add(quantError.mult(project.ditheringConfiguration.hardness * 5 / 16)))
                    }
                    if (drawingPosition.contains(x + 1, y + 1)) {
                        set(imageData, canvas, x + 1, y + 1, get(imageData, canvas, x + 1, y + 1).add(quantError.mult(project.ditheringConfiguration.hardness * 1 / 16)))
                    }
                }
            }
        }
    }

    return imageData;
}

function get(source: ImageData, canvas: HTMLCanvasElement, x: number, y: number): Color {
    return new Color(
        source.data[y * canvas.width * 4 + x * 4],
        source.data[y * canvas.width * 4 + x * 4 + 1],
        source.data[y * canvas.width * 4 + x * 4 + 2],
        source.data[y * canvas.width * 4 + x * 4 + 3]
    )
}

function set(source: ImageData, canvas: HTMLCanvasElement, x: number, y: number, color: Color) {
    source.data[y * canvas.width * 4 + x * 4] = color.r;
    source.data[y * canvas.width * 4 + x * 4 + 1] = color.g;
    source.data[y * canvas.width * 4 + x * 4 + 2] = color.b;
    source.data[y * canvas.width * 4 + x * 4 + 3] = color.a;
}

export function getClosestPaletteEntry(palettes: Palette[], color: Color, matching: Matching): PaletteEntry {
    return _.minBy(_.flatten(palettes.map(p => p.entries)).filter(paletteEntry => paletteEntry.enabled), paletteEntry => matching.delta(paletteEntry.color, color));
}

export function clearNode(node: Element) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

export function parsePalette(json): Palette {
    try {
        return JSON.parse(JSON.stringify(json));
    } catch (e) {
        throw new Error(`Invalid palette : ${e.message}`);
    }
};

export function computeUsage(colors: Uint8ClampedArray, palettes: Palette[]): Map<PaletteEntry, number> {
    const usage = new Map<PaletteEntry, number>();
    _.chunk(colors, 4)
        .map(component => new Color(component[0], component[1], component[2], component[3]))
        .forEach(color => {
            let entry: PaletteEntry = _.find(_.flatten(palettes.map(p => p.entries)), entry => entry.color.r === color.r && entry.color.g === color.g && entry.color.b === color.b && entry.color.a === color.a);
            if (entry) {
                usage.set(entry, (usage.get(entry) || 0) + 1);
            }
        });
    return usage;
}

export function countBeads(usage: Map<PaletteEntry, number>): number {
    return Array.from(usage.values()).reduce(_.add, 0);
}

export function hasUsageUnderPercent(percent: number, usage: Map<PaletteEntry, number>) {
    const total = countBeads(usage);
    const lowerBound = total * (percent / 100);
    return _.find(Array.from(usage.values()), v => v < lowerBound);
}

export function removeColorUnderPercent(percent: number, usage: Map<PaletteEntry, number>) {
    const total = countBeads(usage);
    const lowerBound = total * (percent / 100);
    Array.from(usage.entries()).filter(([k, v]) => v < lowerBound).forEach(([k, v]) => k.enabled = false);
}