import { Palette, PaletteEntry } from "../model/palette/palette.model";
import { Color } from "../model/color/color.model";

import * as _ from 'lodash';

export function drawImageInsideCanvas(canvas, image) {
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
        xStart = (canvas.width - renderableWidth) / 2;
        yStart = 0;
    }

    // If image's aspect ratio is greater than canvas's we fit on width
    // and place the image centrally along height
    else if (imageAspectRatio > canvasAspectRatio) {
        renderableWidth = canvas.width
        renderableHeight = image.height * (renderableWidth / image.width);
        xStart = 0;
        yStart = (canvas.height - renderableHeight) / 2;
    }

    // Happy path - keep aspect ratio
    else {
        renderableHeight = canvas.height;
        renderableWidth = canvas.width;
        xStart = 0;
        yStart = 0;
    }
    canvas.getContext('2d').drawImage(image, xStart, yStart, renderableWidth, renderableHeight);
}

export function reduceColor(canvas: HTMLCanvasElement, palette: Palette) {
    const context = canvas.getContext("2d");
    const sourceColor = context.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let color = new Color(
                sourceColor[y * canvas.width * 4 + x * 4],
                sourceColor[y * canvas.width * 4 + x * 4 + 1],
                sourceColor[y * canvas.width * 4 + x * 4 + 2],
                sourceColor[y * canvas.width * 4 + x * 4 + 3]
            );

            if (color.a !== 0) {
                const closestPaletteEntry = getClosestPaletteEntry(palette, color);
                sourceColor[y * canvas.width * 4 + x * 4] = closestPaletteEntry.color.r;
                sourceColor[y * canvas.width * 4 + x * 4 + 1] = closestPaletteEntry.color.g;
                sourceColor[y * canvas.width * 4 + x * 4 + 2] = closestPaletteEntry.color.b;
                sourceColor[y * canvas.width * 4 + x * 4 + 3] = closestPaletteEntry.color.a;
            }
        }
    }

    return sourceColor;
}

export function getClosestPaletteEntry(palette: Palette, color: Color): PaletteEntry {
    return _.minBy(palette.entries.filter(paletteEntry => paletteEntry.enabled), paletteEntry => distance(paletteEntry.color, color));
}

export function distance(c1: Color, c2: Color) {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2) +
        Math.pow(c1.a - c2.a, 2)
    );
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

export function computeUsage(colors: Uint8ClampedArray, palette: Palette): Map<PaletteEntry, number> {
    const usage = new Map<PaletteEntry, number>();
    _.chunk(colors, 4)
        .map(component => new Color(component[0], component[1], component[2], component[3]))
        .forEach(color => {
            let entry: PaletteEntry = _.find(palette.entries, entry => entry.color.r === color.r && entry.color.g === color.g && entry.color.b === color.b && entry.color.a === color.a);
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