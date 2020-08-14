import * as jsPDF from 'jspdf';
import * as _ from 'lodash';

// Huge hack to get the font working in jsPDF, I give up doing it properly TBH
import './RobotoMono'

import { Printer } from './../printer';
import { Project } from '../../model/project/project.model';
import { PaletteEntry } from '../../model/palette/palette.model';
import { foreground, getPaletteEntryByColorRef } from '../../utils/utils';

class rect {
    x: number
    y: number
    width: number
    height : number

    constructor(
        x: number,
        y: number,
        width: number,
        height : number,
    ){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }


    scale(ratio_x: number, ratio_y:number = ratio_x): rect{
        return new rect(
            this.x + (this.width - this.width * ratio_x)/2,
            this.y + (this.height - this.height * ratio_y)/2,
            this.width * ratio_x,
            this.height * ratio_y,
        )
    }
}

export class PdfPrinter implements Printer {

    name(): string {
        return "PDF";
    }

    print(reducedColor: Uint8ClampedArray, usage: Map<string, number>, project: Project, filename: string) {
        const height = 297;
        const width = 210;
        const margin = 5;

        let doc: jsPDF = new jsPDF();
        doc.setFont('RobotoMono');

        this.boardMapping(doc, project, margin, width, height);
        this.usage(doc, usage, width, height, margin, project);
        this.beadMapping(doc, project, reducedColor, width, height, margin);
        doc.save(`${filename}.pdf`)
    }

    boardMapping(doc: jsPDF, project: Project, margin: number, width: number, height: number) {
        const boardSize = Math.min((width - margin * 2) / project.boardConfiguration.nbBoardHeight, (width - margin * 2) / project.boardConfiguration.nbBoardWidth);
        const boardSheetWidthOffset = (width - boardSize * project.boardConfiguration.nbBoardWidth) / 2;
        const boardSheetHeightOffset = (height - boardSize * project.boardConfiguration.nbBoardHeight) / 2;
        const fontSize = 12;

        doc.setFontSize(fontSize);
        for (let y = 0; y < project.boardConfiguration.nbBoardHeight; y++) {
            for (let x = 0; x < project.boardConfiguration.nbBoardWidth; x++) {
                const container = new rect(
                    x * boardSize + boardSheetWidthOffset, 
                    y * boardSize + boardSheetHeightOffset, 
                    boardSize, 
                    boardSize
                )
                doc.rect(container.x, container.y, container.width, container.height);
                

                const txtContainer = container.scale(.5)
                let text = `${y} - ${x}`;
                doc.setFontSize(this.biggestFontSize(text, txtContainer))
                doc.text(
                    txtContainer.x + txtContainer.width / 2, 
                    txtContainer.y + txtContainer.height / 2 + this.fontSizeToHeightMm(doc.getFontSize()) / 2,
                    text, 
                    {
                        align: "center"
                    }
                );
            }
        }
    }

    usage(doc: jsPDF, usage: Map<string, number>, width: number, height: number, margin:number, project: Project) {
        const usagePerPage = 30;

        const maxUsage = (""+_.max(Array.from(usage.values())))
        const longestRef = _.maxBy(Array.from(usage.keys()), s => s.length)

        const longestWord = maxUsage.length > longestRef.length ? maxUsage: longestRef;

        const refWidth = 50;
        const symbolWidth = project.exportConfiguration.useSymbols ? 50 : 0;
        const usageWidth = 50;

        const heightWithMargins = (height - 2 * margin) 
        const rowHeight = heightWithMargins / usagePerPage

        _.chunk(Array.from(usage.entries()).sort(([k1, v1], [k2, v2]) => v2 - v1), usagePerPage).forEach(entries => {
            doc.addPage();
            const usageSheetWidthOffset = (width - refWidth - usageWidth - symbolWidth) / 2;
            const usageSheetHeightOffset = margin;

            // ref column
            Array.from(entries).forEach(([k, v], idx) => {
                const entry = getPaletteEntryByColorRef(project.paletteConfiguration.palettes, ""+k);
                let bg = entry.color;
                let fg = foreground(bg);
                doc.setFillColor(bg.r, bg.g, bg.b);
                doc.setTextColor(fg.r, fg.g, fg.b);

                const container = new rect(
                    usageSheetWidthOffset, 
                    rowHeight * idx + usageSheetHeightOffset, 
                    refWidth, 
                    rowHeight
                )
                doc.rect(container.x, container.y, container.width, container.height, 'FD');

                const txtContainer = container.scale(.9, .8)
                let text = k;
                doc.setFontSize(this.biggestFontSize(longestWord, txtContainer))
                doc.text(
                    txtContainer.x + txtContainer.width / 2, 
                    txtContainer.y + txtContainer.height / 2 + this.fontSizeToHeightMm(doc.getFontSize()) / 2,
                    text, 
                    {
                        align: "center"
                    }
                );
            });

            if (project.exportConfiguration.useSymbols) {
                // symbol column
                Array.from(entries).forEach(([k, v], idx) => {
                    const entry = getPaletteEntryByColorRef(project.paletteConfiguration.palettes, ""+k);
                    let bg = entry.color;
                    let fg = foreground(bg);
                    doc.setFillColor(bg.r, bg.g, bg.b);
                    doc.setTextColor(fg.r, fg.g, fg.b);

                    const container = new rect(
                        usageSheetWidthOffset + refWidth, 
                        rowHeight * idx + usageSheetHeightOffset, 
                        symbolWidth, 
                        rowHeight
                    )
                    doc.rect(container.x, container.y, container.width, container.height, 'FD');
    
                    const txtContainer = container.scale(.9, .8)
                    let text = (project.paletteConfiguration.palettes.length  > 1? entry.prefix : '') + entry.symbol;
                    doc.setFontSize(this.biggestFontSize(longestWord, txtContainer))
                    doc.text(
                        txtContainer.x + txtContainer.width / 2, 
                        txtContainer.y + txtContainer.height / 2 + this.fontSizeToHeightMm(doc.getFontSize()) / 2,
                        text, 
                        {
                            align: "center"
                        }
                    );
                });
            }

            // usage column
            Array.from(entries).forEach(([k, v], idx) => {
                const entry = getPaletteEntryByColorRef(project.paletteConfiguration.palettes, ""+k);
                let bg = entry.color;
                let fg = foreground(bg);
                doc.setFillColor(bg.r, bg.g, bg.b);
                doc.setTextColor(fg.r, fg.g, fg.b);

                const container = new rect(
                    usageSheetWidthOffset + refWidth + symbolWidth, 
                    rowHeight * idx + usageSheetHeightOffset, 
                    usageWidth, 
                    rowHeight
                )
                doc.rect(container.x, container.y, container.width, container.height, 'FD');

                const txtContainer = container.scale(.9, .8)
                let text = "" + v;
                doc.setFontSize(this.biggestFontSize(longestWord, txtContainer))
                doc.text(
                    txtContainer.x + txtContainer.width / 2, 
                    txtContainer.y + txtContainer.height / 2 + this.fontSizeToHeightMm(doc.getFontSize()) / 2,
                    text, 
                    {
                        align: "center"
                    }
                );
            });
        });
    }

    beadMapping(doc: jsPDF, project: Project, reducedColor: Uint8ClampedArray, width: number, height: number, margin: number) {
        const beadSize = (width - margin * 2) / project.boardConfiguration.board.nbBeadPerRow;
        const beadSheetOffset = (height - beadSize * project.boardConfiguration.board.nbBeadPerRow) / 2;

        for (let i = 0; i < project.boardConfiguration.nbBoardHeight; i++) {
            for (let j = 0; j < project.boardConfiguration.nbBoardWidth; j++) {
                doc.addPage();
                doc.setFontSize(24);
                let text = `${i} - ${j}`;
                let textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                let textOffset = (doc.internal.pageSize.width - textWidth) / 2;
                doc.text(textOffset, margin * 2, text);

                for (let y = 0; y < project.boardConfiguration.board.nbBeadPerRow; y++) {
                    for (let x = 0; x < project.boardConfiguration.board.nbBeadPerRow; x++) {
                        doc.rect(x * beadSize + margin, y * beadSize + beadSheetOffset, beadSize, beadSize);

                        const paletteEntry: PaletteEntry = _.find(_.flatten(project.paletteConfiguration.palettes.map(p => p.entries)), entry => {
                            return entry.color.r == reducedColor[4 * ((y + i * project.boardConfiguration.board.nbBeadPerRow) * project.boardConfiguration.board.nbBeadPerRow * project.boardConfiguration.nbBoardWidth + x + j * project.boardConfiguration.board.nbBeadPerRow)]
                                && entry.color.g == reducedColor[4 * ((y + i * project.boardConfiguration.board.nbBeadPerRow) * project.boardConfiguration.board.nbBeadPerRow * project.boardConfiguration.nbBoardWidth + x + j * project.boardConfiguration.board.nbBeadPerRow) + 1]
                                && entry.color.b == reducedColor[4 * ((y + i * project.boardConfiguration.board.nbBeadPerRow) * project.boardConfiguration.board.nbBeadPerRow * project.boardConfiguration.nbBoardWidth + x + j * project.boardConfiguration.board.nbBeadPerRow) + 2]
                                && entry.color.a == reducedColor[4 * ((y + i * project.boardConfiguration.board.nbBeadPerRow) * project.boardConfiguration.board.nbBeadPerRow * project.boardConfiguration.nbBoardWidth + x + j * project.boardConfiguration.board.nbBeadPerRow) + 3];
                        });
                        if (paletteEntry) {
                            doc.setFillColor(paletteEntry.color.r, paletteEntry.color.g, paletteEntry.color.b);
                            const container = new rect(
                                x * beadSize + margin, 
                                y * beadSize + beadSheetOffset, 
                                beadSize, 
                                beadSize
                            )
                            doc.rect(container.x, container.y, container.width, container.height, 'FD');
            
                            const txtContainer = container.scale(.8)
                            let text = paletteEntry.ref;
                            if (project.exportConfiguration.useSymbols) {
                                text = (project.paletteConfiguration.palettes.length > 1 ? paletteEntry.prefix : '') + paletteEntry.symbol;
                            }
                            doc.setFontSize(this.biggestFontSize(text, txtContainer))
                            let fg = foreground(paletteEntry.color)
                            doc.setTextColor(fg.r, fg.g, fg.b)
                            doc.text(
                                txtContainer.x + txtContainer.width / 2, 
                                txtContainer.y + txtContainer.height / 2 + this.fontSizeToHeightMm(doc.getFontSize()) / 2,
                                text, 
                                {
                                    align: "center"
                                }
                            );
                        } else {
                            doc.line(x * beadSize + margin, y * beadSize + beadSheetOffset, x * beadSize + margin + beadSize, y * beadSize + beadSheetOffset + beadSize);
                        }
                    }
                }
            }
        }
    }


    // Welcome to realm of magic values, works only for RobotoMono :S
    fontSizeToHeightMm(fontSize: number) {
        return (fontSize * 0.3527777778) / 1.5;
    }
    biggestFontSize(text:string,  r: rect): number {
        const biggestForWidth = r.width / (text.length * 0.60009765625 /  (72/25.6))
        const expectedHeight = (biggestForWidth * 0.3527777778) / 1.15

        if (expectedHeight <= r.height) {
            return biggestForWidth
        }

        return biggestForWidth * r.height / expectedHeight
    }

}