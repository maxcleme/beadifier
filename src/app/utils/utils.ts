import { Palette } from '../model/palette/palette.model';
import { Color } from '../model/color/color.model';

import * as ld from 'lodash';
import { Matching } from '../model/matching/matching.model';
import { Project } from '../model/project/project.model';
import { RendererConfiguration } from '../model/configuration/renderer-configuration.model';

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

export function drawImageInsideCanvas(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    rendererConfiguration: RendererConfiguration,
): ImagePosition {
    /**
     * Credit to : https://sdqali.in/blog/2013/10/03/fitting-an-image-in-to-a-canvas-object/
     */

    const imageAspectRatio = image.width / image.height;
    const canvasAspectRatio = canvas.width / canvas.height;
    let renderableHeight, renderableWidth;

    // If image's aspect ratio is less than canvas's we fit on height
    // and place the image centrally along width
    if (imageAspectRatio < canvasAspectRatio) {
        renderableHeight = rendererConfiguration.fit
            ? canvas.height
            : image.height;
        renderableWidth = rendererConfiguration.fit
            ? image.width * (renderableHeight / image.height)
            : image.width;
    } else if (imageAspectRatio > canvasAspectRatio) {
        renderableWidth = rendererConfiguration.fit
            ? canvas.width
            : image.width;
        renderableHeight = rendererConfiguration.fit
            ? image.height * (renderableWidth / image.width)
            : image.height;
    } else {
        renderableHeight = rendererConfiguration.fit
            ? canvas.height
            : image.height;
        renderableWidth = rendererConfiguration.fit
            ? canvas.width
            : image.width;
    }

    const xStart = rendererConfiguration.center
        ? (canvas.width - renderableWidth) / 2
        : 0;
    const yStart = rendererConfiguration.center
        ? (canvas.height - renderableHeight) / 2
        : 0;

    const rxStart = Math.floor(xStart);
    const ryStart = Math.floor(yStart);
    const rrenderableWidth = Math.floor(renderableWidth);
    const rrenderableHeight = Math.floor(renderableHeight);
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not get 2d context');
    }
    context.filter = image.style.filter;
    context.drawImage(
        image,
        rxStart,
        ryStart,
        rrenderableWidth,
        rrenderableHeight,
    );
    return new ImagePosition(
        rxStart,
        ryStart,
        rrenderableWidth,
        rrenderableHeight,
    );
}

export function reduceColor(
    canvas: HTMLCanvasElement,
    project: Project,
    drawingPosition: ImagePosition,
): ImageData {
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not get canvas context');
    }
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const color = get(imageData, canvas, x, y);
            if (color.a !== 0) {
                const closestPaletteEntry = getClosestPaletteEntry(
                    project.paletteConfiguration.palettes,
                    color,
                    project.matchingConfiguration.matching,
                );
                if (!closestPaletteEntry) {
                    continue;
                }
                set(imageData, canvas, x, y, closestPaletteEntry.color);

                if (project.ditheringConfiguration.enable) {
                    const quantError = color.sub(closestPaletteEntry.color);

                    if (drawingPosition.contains(x + 1, y)) {
                        set(
                            imageData,
                            canvas,
                            x + 1,
                            y,
                            get(imageData, canvas, x + 1, y).add(
                                quantError.mult(
                                    ((project.ditheringConfiguration.hardness /
                                        100) *
                                        7) /
                                        16,
                                ),
                            ),
                        );
                    }
                    if (drawingPosition.contains(x - 1, y + 1)) {
                        set(
                            imageData,
                            canvas,
                            x - 1,
                            y + 1,
                            get(imageData, canvas, x - 1, y + 1).add(
                                quantError.mult(
                                    ((project.ditheringConfiguration.hardness /
                                        100) *
                                        3) /
                                        16,
                                ),
                            ),
                        );
                    }
                    if (drawingPosition.contains(x, y + 1)) {
                        set(
                            imageData,
                            canvas,
                            x,
                            y + 1,
                            get(imageData, canvas, x, y + 1).add(
                                quantError.mult(
                                    ((project.ditheringConfiguration.hardness /
                                        100) *
                                        5) /
                                        16,
                                ),
                            ),
                        );
                    }
                    if (drawingPosition.contains(x + 1, y + 1)) {
                        set(
                            imageData,
                            canvas,
                            x + 1,
                            y + 1,
                            get(imageData, canvas, x + 1, y + 1).add(
                                quantError.mult(
                                    ((project.ditheringConfiguration.hardness /
                                        100) *
                                        1) /
                                        16,
                                ),
                            ),
                        );
                    }
                }
            }
        }
    }

    return imageData;
}

function get(
    source: ImageData,
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
): Color {
    return new Color(
        source.data[y * canvas.width * 4 + x * 4],
        source.data[y * canvas.width * 4 + x * 4 + 1],
        source.data[y * canvas.width * 4 + x * 4 + 2],
        source.data[y * canvas.width * 4 + x * 4 + 3],
    );
}

function set(
    source: ImageData,
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    color: Color,
) {
    source.data[y * canvas.width * 4 + x * 4] = color.r;
    source.data[y * canvas.width * 4 + x * 4 + 1] = color.g;
    source.data[y * canvas.width * 4 + x * 4 + 2] = color.b;
    source.data[y * canvas.width * 4 + x * 4 + 3] = color.a;
}

export function getClosestPaletteEntry(
    palettes: Palette[],
    color: Color,
    matching: Matching,
) {
    return ld.minBy(
        ld
            .flatten(palettes.map((p) => p.entries))
            .filter((paletteEntry) => paletteEntry.enabled),
        (paletteEntry) => matching.delta(paletteEntry.color, color),
    );
}

export function clearNode(node: Element) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

export function parsePalette(json: unknown): Palette {
    try {
        return JSON.parse(JSON.stringify(json));
    } catch (e) {
        throw new Error(
            `Invalid palette : ${typeof e === 'object' && e && 'message' in e ? e.message : ''}`,
        );
    }
}

export function computeUsage(
    colors: Uint8ClampedArray,
    palettes: Palette[],
): Map<string, number> {
    const usage = new Map<string, number>();
    ld.chunk(colors, 4)
        .map(
            (component) =>
                new Color(
                    component[0],
                    component[1],
                    component[2],
                    component[3],
                ),
        )
        .forEach((color) => {
            const entry = ld.find(
                ld.flatten(palettes.map((p) => p.entries)),
                (e) =>
                    e.color.r === color.r &&
                    e.color.g === color.g &&
                    e.color.b === color.b &&
                    e.color.a === color.a,
            );
            if (entry?.ref) {
                usage.set(entry.ref, (usage.get(entry.ref) || 0) + 1);
            }
        });
    return usage;
}

export function countBeads(usage: Map<string, number>): number {
    return Array.from(usage.values()).reduce(ld.add, 0);
}

export function hasUsageUnderPercent(
    percent: number,
    usage: Map<string, number>,
) {
    const total = countBeads(usage);
    const lowerBound = total * (percent / 100);
    return ld.find(Array.from(usage.values()), (v) => v < lowerBound);
}

export function removeColorUnderPercent(
    percent: number,
    usage: Map<string, number>,
    palettes: Palette[],
) {
    const total = countBeads(usage);
    const lowerBound = total * (percent / 100);
    Array.from(usage.entries())
        .filter(([_k, v]) => v < lowerBound)
        .forEach(([k, _v]) => {
            palettes
                .flatMap((p) => p.entries)
                .filter((e) => e.ref === k)
                .forEach((e) => {
                    e.enabled = false;
                });
        });
}

export function getPaletteEntryByColorRef(palettes: Palette[], ref: string) {
    const paletteList = ld.flatten(palettes.map((p) => p.entries));
    return ld.minBy(
        ld.filter(paletteList, (paletteEntry) => {
            return paletteEntry.enabled && paletteEntry.ref === ref;
        }),
    );
}

export function foreground(color: Color): Color {
    if (0.299 * color.r + 0.587 * color.g + 0.114 * color.b > 255 / 2) {
        return new Color(0, 0, 0, 255);
    }
    return new Color(255, 255, 255, 255);
}
