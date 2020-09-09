import 'canvas2svg';
import * as _ from 'lodash';

import { Printer } from '../printer';
import { Project } from '../../model/project/project.model';
import { PaletteEntry } from '../../model/palette/palette.model';
import { Color } from '../../model/color/color.model';
import { foreground, getPaletteEntryByColorRef } from '../../utils/utils';

import { defsStyle } from './MonoFont';

class Rect {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    scale(ratio_x: number, ratio_y: number = ratio_x): Rect {
        return new Rect(
            this.x + (this.width - this.width * ratio_x) / 2,
            this.y + (this.height - this.height * ratio_y) / 2,
            this.width * ratio_x,
            this.height * ratio_y
        );
    }

    centerX(): number {
        return this.x + this.width / 2;
    }

    centerY(): number {
        return this.y + this.height / 2;
    }
}

export class SvgPrinter implements Printer {
    name(): string {
        return 'SVG (Beta)';
    }

    drawSVG(
        reducedColor: Uint8ClampedArray,
        usage: Map<string, number>,
        project: Project
    ): SVGElement {
        const height =
            project.boardConfiguration.nbBoardHeight *
            project.boardConfiguration.board.nbBeadPerRow;
        const width =
            project.boardConfiguration.nbBoardWidth *
            project.boardConfiguration.board.nbBeadPerRow;

        const beadSize = 75;
        const beadMargin = 1;
        const boardMargin = 5;
        const patternWidth =
            project.boardConfiguration.nbBoardWidth *
            (2 * boardMargin +
                project.boardConfiguration.board.nbBeadPerRow *
                    (beadSize + beadMargin));
        const patternHeight =
            project.boardConfiguration.nbBoardHeight *
            (2 * boardMargin +
                project.boardConfiguration.board.nbBeadPerRow *
                    (beadSize + beadMargin));

        const inventoryMargin = 100;
        const inventoryTabMargin = 5;
        const inventoryTabHeight = 60;

        const inventoryTabNameWidth = 150;
        const inventoryTabSymbolWidth = project.exportConfiguration.useSymbols
            ? 150
            : 0;
        const inventoryTabCountWidth = 150;
        const inventoryWidth =
            inventoryTabNameWidth +
            inventoryTabSymbolWidth +
            inventoryTabCountWidth +
            (project.exportConfiguration.useSymbols ? 4 : 3) *
                inventoryTabMargin;

        const inventoryHeight =
            usage.size * (inventoryTabHeight + inventoryTabMargin) +
            inventoryTabMargin;

        // @ts-ignore
        const ctx = new C2S(
            patternWidth + inventoryMargin + inventoryWidth,
            Math.max(patternHeight, inventoryHeight)
        );
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(
            0,
            0,
            patternWidth + inventoryMargin + inventoryWidth,
            Math.max(patternHeight, inventoryHeight)
        );

        const maxUsage = '' + _.max(Array.from(usage.values()));
        const longestRef = _.maxBy(Array.from(usage.keys()), (s) => s.length);

        const longestWord =
            maxUsage.length > longestRef.length ? maxUsage : longestRef;

        // inventory table
        let cpt = 0;
        ctx.fillStyle = `rgb(0,0,0)`;
        ctx.fillRect(
            patternWidth + inventoryMargin,
            0,
            inventoryWidth,
            inventoryHeight
        );
        Array.from(usage.entries())
            .sort(([k1, v1], [k2, v2]) => v2 - v1)
            .forEach(([k, v]) => {
                const entry = getPaletteEntryByColorRef(
                    project.paletteConfiguration.palettes,
                    k
                );
                const bg = entry.color;
                const fg = foreground(bg);
                ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`;
                ctx.fillRect(
                    patternWidth + inventoryTabMargin + inventoryMargin,
                    inventoryTabMargin +
                        cpt * (inventoryTabHeight + inventoryTabMargin),
                    inventoryTabNameWidth,
                    inventoryTabHeight
                );
                if (project.exportConfiguration.useSymbols) {
                    ctx.fillRect(
                        patternWidth +
                            2 * inventoryTabMargin +
                            inventoryMargin +
                            inventoryTabCountWidth,
                        inventoryTabMargin +
                            cpt * (inventoryTabHeight + inventoryTabMargin),
                        inventoryTabNameWidth,
                        inventoryTabHeight
                    );
                }
                ctx.fillRect(
                    patternWidth +
                        (project.exportConfiguration.useSymbols ? 3 : 2) *
                            inventoryTabMargin +
                        inventoryMargin +
                        inventoryTabCountWidth +
                        inventoryTabSymbolWidth,
                    inventoryTabMargin +
                        cpt * (inventoryTabHeight + inventoryTabMargin),
                    inventoryTabNameWidth,
                    inventoryTabHeight
                );

                ctx.fillStyle = `rgb(${fg.r}, ${fg.g}, ${fg.b})`;
                let txtContainerName = new Rect(
                    patternWidth + inventoryMargin + inventoryTabMargin,
                    cpt * (inventoryTabMargin + inventoryTabHeight) +
                        inventoryTabMargin,
                    inventoryTabNameWidth,
                    inventoryTabHeight
                ).scale(0.7);
                ctx.font = `${this.biggestFontSize(
                    longestWord,
                    txtContainerName
                )}pt MonoFont`;
                ctx.fillText(
                    k,
                    txtContainerName.centerX(),
                    txtContainerName.centerY()
                );

                if (project.exportConfiguration.useSymbols) {
                    const text =
                        (project.paletteConfiguration.palettes.length > 1
                            ? entry.prefix
                            : '') + entry.symbol;
                    txtContainerName = new Rect(
                        patternWidth +
                            inventoryMargin +
                            2 * inventoryTabMargin +
                            inventoryTabNameWidth,
                        cpt * (inventoryTabMargin + inventoryTabHeight) +
                            inventoryTabMargin,
                        inventoryTabNameWidth,
                        inventoryTabHeight
                    ).scale(0.7);
                    ctx.font = `${this.biggestFontSize(
                        longestWord,
                        txtContainerName
                    )}pt MonoFont`;
                    ctx.fillText(
                        text,
                        txtContainerName.centerX(),
                        txtContainerName.centerY()
                    );
                }

                const txtContainerCount = new Rect(
                    patternWidth +
                        inventoryMargin +
                        (project.exportConfiguration.useSymbols ? 3 : 2) *
                            inventoryTabMargin +
                        inventoryTabNameWidth +
                        inventoryTabSymbolWidth,
                    cpt * (inventoryTabMargin + inventoryTabHeight) +
                        inventoryTabMargin,
                    inventoryTabCountWidth,
                    inventoryTabHeight
                ).scale(0.7);
                ctx.font = `${this.biggestFontSize(
                    longestWord,
                    txtContainerCount
                )}pt MonoFont`;
                ctx.fillText(
                    '' + v,
                    txtContainerCount.centerX(),
                    txtContainerCount.centerY()
                );

                cpt++;
            });

        ctx.fillStyle = 'rgb(0,0,0)';

        // boards
        for (let x = 0; x < project.boardConfiguration.nbBoardWidth + 1; x++) {
            const offset =
                x *
                (boardMargin +
                    project.boardConfiguration.board.nbBeadPerRow * beadSize +
                    (1 + project.boardConfiguration.board.nbBeadPerRow) *
                        beadMargin);
            ctx.fillRect(
                offset,
                0,
                boardMargin,
                boardMargin +
                    project.boardConfiguration.nbBoardHeight *
                        (boardMargin +
                            project.boardConfiguration.board.nbBeadPerRow *
                                beadSize +
                            (project.boardConfiguration.board.nbBeadPerRow +
                                1) *
                                beadMargin)
            );
        }
        for (let y = 0; y < project.boardConfiguration.nbBoardHeight + 1; y++) {
            const offset =
                y *
                (boardMargin +
                    project.boardConfiguration.board.nbBeadPerRow * beadSize +
                    (1 + project.boardConfiguration.board.nbBeadPerRow) *
                        beadMargin);
            ctx.fillRect(
                0,
                offset,
                boardMargin +
                    project.boardConfiguration.nbBoardWidth *
                        (boardMargin +
                            project.boardConfiguration.board.nbBeadPerRow *
                                beadSize +
                            (project.boardConfiguration.board.nbBeadPerRow +
                                1) *
                                beadMargin),
                boardMargin
            );
        }

        // pattern

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const color = new Color(
                    reducedColor[y * width * 4 + x * 4],
                    reducedColor[y * width * 4 + x * 4 + 1],
                    reducedColor[y * width * 4 + x * 4 + 2],
                    reducedColor[y * width * 4 + x * 4 + 3]
                );

                const beadX =
                    x * (beadSize + beadMargin) +
                    beadMargin +
                    boardMargin +
                    (beadMargin + boardMargin) *
                        Math.floor(
                            x / project.boardConfiguration.board.nbBeadPerRow
                        );
                const beadY =
                    y * (beadSize + beadMargin) +
                    beadMargin +
                    boardMargin +
                    (beadMargin + boardMargin) *
                        Math.floor(
                            y / project.boardConfiguration.board.nbBeadPerRow
                        );

                const container = new Rect(beadX, beadY, beadSize, beadSize);
                if (color.a === 255) {
                    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    ctx.fillRect(
                        container.x,
                        container.y,
                        container.width,
                        container.height
                    );

                    const paletteEntry: PaletteEntry = _.find(
                        _.flatten(
                            project.paletteConfiguration.palettes.map(
                                (p) => p.entries
                            )
                        ),
                        (entry) => {
                            return (
                                entry.color.r === color.r &&
                                entry.color.g === color.g &&
                                entry.color.b === color.b
                            );
                        }
                    );
                    if (paletteEntry) {
                        const bg = paletteEntry.color;
                        const fg = foreground(bg);
                        ctx.fillStyle = `rgb(${fg.r}, ${fg.g}, ${fg.b})`;

                        const txtContainer = container.scale(0.7);
                        let text = paletteEntry.ref;
                        if (project.exportConfiguration.useSymbols) {
                            text =
                                (project.paletteConfiguration.palettes.length >
                                1
                                    ? paletteEntry.prefix
                                    : '') + paletteEntry.symbol;
                        }
                        ctx.font = `${this.biggestFontSize(
                            text,
                            txtContainer
                        )}pt MonoFont`;
                        ctx.fillText(
                            text,
                            txtContainer.centerX(),
                            txtContainer.centerY()
                        );

                        let referenceText = paletteEntry.ref;
                        if (project.exportConfiguration.useSymbols) {
                            referenceText = paletteEntry.symbol;
                            if (
                                project.paletteConfiguration.palettes.length > 1
                            ) {
                                referenceText =
                                    paletteEntry.prefix + referenceText;
                            }
                        }
                        ctx.fillText(
                            referenceText,
                            beadX + beadSize / 2,
                            beadY + beadSize / 2
                        );
                    }
                } else {
                    ctx.fillStyle = 'rgb(0,0,0)';
                    ctx.fillRect(
                        container.x,
                        container.y,
                        container.width,
                        container.height
                    );
                    ctx.fillStyle = 'rgb(255,255,255)';
                    ctx.fillRect(
                        beadX + 1,
                        beadY + 1,
                        beadSize - 2 * 1,
                        beadSize - 2 * 1
                    );

                    ctx.strokeStyle = 'rgb(0,0,0)';
                    ctx.beginPath();
                    ctx.moveTo(beadX + 1, beadY + 1);
                    ctx.lineTo(
                        beadX + 1 + beadSize - 2 * 1,
                        beadY + 1 + beadSize - 2 * 1
                    );
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(beadX + 1 + beadSize - 2 * 1, beadY + 1);
                    ctx.lineTo(beadX + 1, beadY + 1 + beadSize - 2 * 1);
                    ctx.stroke();
                }
            }
        }

        // add custom <defs> in order to embded font reference
        // not the best way to do, but at least the font is embed
        // and computation regarding font size with monospace font still work outside this app
        const defs = document.createElement('defs');
        defs.innerHTML = defsStyle;
        const svg = ctx.getSvg();
        svg.insertBefore(defs, svg.firstChild);
        return svg;
    }

    print(
        reducedColor: Uint8ClampedArray,
        usage: Map<string, number>,
        project: Project,
        filename: string
    ) {
        const svg = this.drawSVG(reducedColor, usage, project);

        // generate & save file
        const a = document.createElement('a');
        a.href = URL.createObjectURL(
            new Blob([new XMLSerializer().serializeToString(svg)], {
                type: 'image/svg+xml',
            })
        );
        a.setAttribute('download', `${filename}.svg`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Welcome to realm of magic values, works only for current font
    biggestFontSize(text: string, r: Rect): number {
        const biggestForWidth = r.width / text.length / 0.959136962890625;
        const expectedHeight = biggestForWidth * 0.959136962890625;
        if (expectedHeight <= r.height) {
            return biggestForWidth;
        }
        return (biggestForWidth * r.height) / expectedHeight;
    }
}
