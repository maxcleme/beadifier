import 'canvas2svg';
import * as _ from 'lodash';

import { Printer } from '../printer';
import { Project } from "../../model/project/project.model";
import { PaletteEntry } from '../../model/palette/palette.model';
import { Color } from '../../model/color/color.model';

export class SvgPrinter implements Printer {

    name(): string {
        return "SVG (Beta)";
    }

    drawSVG(reducedColor: Uint8ClampedArray, usage: Map<string, number>, project: Project): SVGElement {
        const height = project.boardConfiguration.nbBoardHeight * project.boardConfiguration.board.nbBeadPerRow;
        const width = project.boardConfiguration.nbBoardWidth * project.boardConfiguration.board.nbBeadPerRow;

        const beadSize = 75;
        const beadMargin = 1;
        const boardMargin = 5;
        const patternWidth = project.boardConfiguration.nbBoardWidth * (2 * boardMargin + project.boardConfiguration.board.nbBeadPerRow * (beadSize + beadMargin));
        const patternHeight = project.boardConfiguration.nbBoardHeight * (2 * boardMargin + project.boardConfiguration.board.nbBeadPerRow * (beadSize + beadMargin));

        const inventoryMargin = 100;
        const inventoryTabMargin = 5;
        const inventoryTabHeight = 60;
        const inventoryTabNameWidth = 60;
        const inventoryTabCountWidth = 100;
        const inventoryWidth = inventoryTabNameWidth + inventoryTabCountWidth + 3 * inventoryTabMargin;
        const inventoryHeight = usage.size * (inventoryTabHeight + inventoryTabMargin) + inventoryTabMargin;

        // @ts-ignore
        const ctx = new C2S(
            patternWidth + inventoryMargin + inventoryWidth,
            Math.max(patternHeight, inventoryHeight)
        );
        ctx.fillStyle = 'rgb(255,255,255)'
        ctx.fillRect(0, 0, patternWidth + inventoryMargin + inventoryWidth, Math.max(patternHeight, inventoryHeight));


        ctx.fillStyle = 'rgb(0,0,0)';

        // inventory table
        for (let x = 0; x < usage.size + 1; x++) {
            const offset = x * (inventoryTabMargin + inventoryTabHeight);
            ctx.fillRect(patternWidth + inventoryMargin, offset, inventoryWidth, inventoryTabMargin);
        }
        ctx.fillRect(patternWidth + inventoryMargin, 0, inventoryTabMargin, usage.size * (inventoryTabHeight + inventoryTabMargin) + inventoryTabMargin);
        ctx.fillRect(patternWidth + inventoryMargin + inventoryTabMargin + inventoryTabNameWidth, 0, inventoryTabMargin, usage.size * (inventoryTabHeight + inventoryTabMargin) + inventoryTabMargin);
        ctx.fillRect(patternWidth + inventoryMargin + 2 * inventoryTabMargin + inventoryTabNameWidth + inventoryTabCountWidth, 0, inventoryTabMargin, usage.size * (inventoryTabHeight + inventoryTabMargin) + inventoryTabMargin);



        // inventory values
        let y = 0
        Array.from(usage.entries()).sort(([k1, v1], [k2, v2]) => v2 - v1).forEach(([k, v]) => {
            ctx.font = "14px Roboto";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            ctx.fillText(k, patternWidth + inventoryMargin + inventoryTabMargin + inventoryTabNameWidth / 2, y * (inventoryTabMargin + inventoryTabHeight) + inventoryTabMargin + inventoryTabHeight / 2);
            ctx.fillText(v, patternWidth + inventoryMargin + 2 * inventoryTabMargin + inventoryTabNameWidth + inventoryTabCountWidth / 2, y * (inventoryTabMargin + inventoryTabHeight) + inventoryTabMargin + inventoryTabHeight / 2);
            y++
        });

        // boards
        for (let x = 0; x < project.boardConfiguration.nbBoardWidth + 1; x++) {
            const offset = x * (boardMargin + project.boardConfiguration.board.nbBeadPerRow * beadSize + (1 + project.boardConfiguration.board.nbBeadPerRow) * beadMargin);
            ctx.fillRect(offset, 0, boardMargin, boardMargin + project.boardConfiguration.nbBoardHeight * (boardMargin + project.boardConfiguration.board.nbBeadPerRow * beadSize + (project.boardConfiguration.board.nbBeadPerRow + 1) * beadMargin));
        }
        for (let y = 0; y < project.boardConfiguration.nbBoardHeight + 1; y++) {
            const offset = y * (boardMargin + project.boardConfiguration.board.nbBeadPerRow * beadSize + (1 + project.boardConfiguration.board.nbBeadPerRow) * beadMargin);
            ctx.fillRect(0, offset, boardMargin + project.boardConfiguration.nbBoardWidth * (boardMargin + project.boardConfiguration.board.nbBeadPerRow * beadSize + (project.boardConfiguration.board.nbBeadPerRow + 1) * beadMargin), boardMargin);
        }

        // pattern
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let color = new Color(
                    reducedColor[y * width * 4 + x * 4],
                    reducedColor[y * width * 4 + x * 4 + 1],
                    reducedColor[y * width * 4 + x * 4 + 2],
                    reducedColor[y * width * 4 + x * 4 + 3]
                );

                const beadX = x * (beadSize + beadMargin) + beadMargin + boardMargin + (beadMargin + boardMargin) * (Math.floor(x / project.boardConfiguration.board.nbBeadPerRow));
                const beadY = y * (beadSize + beadMargin) + beadMargin + boardMargin + (beadMargin + boardMargin) * (Math.floor(y / project.boardConfiguration.board.nbBeadPerRow));

                if (color.a === 255) {
                    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    ctx.fillRect(beadX, beadY, beadSize, beadSize);

                    let paletteEntry: PaletteEntry = _.find(_.flatten(project.paletteConfiguration.palettes.map(p => p.entries)), entry => {
                        return entry.color.r === color.r && entry.color.g === color.g && entry.color.b === color.b;
                    });
                    if (paletteEntry) {
                        ctx.font = "14px Roboto";
                        ctx.textBaseline = "middle";
                        ctx.textAlign = "center";

                        if ((0.299 * paletteEntry.color.r + 0.587 * paletteEntry.color.g + 0.114 * paletteEntry.color.b) > (255 / 2)) {
                            ctx.fillStyle = `rgb(0,0,0)`;
                        } else {
                            ctx.fillStyle = `rgb(255,255,255)`;
                        }
                        ctx.fillText(paletteEntry.ref, beadX + beadSize / 2, beadY + beadSize / 2);
                    }
                } else {
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillRect(beadX, beadY, beadSize, beadSize);
                    ctx.fillStyle = "rgb(255,255,255)";
                    ctx.fillRect(beadX + 1, beadY + 1, beadSize - 2 * 1, beadSize - 2 * 1);

                    ctx.strokeStyle = "rgb(0,0,0)"
                    ctx.beginPath();
                    ctx.moveTo(beadX + 1, beadY + 1);
                    ctx.lineTo(beadX + 1 + beadSize - 2 * 1, beadY + 1 + beadSize - 2 * 1);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(beadX + 1 + beadSize - 2 * 1, beadY + 1);
                    ctx.lineTo(beadX + 1, beadY + 1 + beadSize - 2 * 1);
                    ctx.stroke();
                }

            }
        }

        return ctx.getSvg();
    } 

    print(reducedColor: Uint8ClampedArray, usage: Map<string, number>, project: Project, filename: string) {
        let svg = this.drawSVG(reducedColor, usage, project);
        
        // generate & save file
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
        a.setAttribute("download", `${filename}.svg`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}