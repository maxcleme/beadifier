import * as jsPDF from 'jspdf';
import * as _ from 'lodash';

import { Printer } from './../printer';
import { Project } from '../../model/project/project.model';
import { PaletteEntry } from '../../model/palette/palette.model';
import { getPaletteEntryByColorRef } from '../../utils/utils';

export class PdfPrinter implements Printer {
    
    name(): string {
        return "PDF";
    }

    print(reducedColor: Uint8ClampedArray, usage: Map<string, number>, project: Project, filename: string) {
        const height = 297;
        const width = 210;
        const margin = 5;

        let doc: jsPDF = new jsPDF();
        this.boardMapping(doc, project, margin, width, height);
        this.usage(doc, usage, width, height, project);
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
                doc.rect(x * boardSize + boardSheetWidthOffset, y * boardSize + boardSheetHeightOffset, boardSize, boardSize);

                let text = `${y} - ${x}`;
                let textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                let textOffsetWidth = (boardSize - textWidth) / 2;
                doc.text(x * boardSize + boardSheetWidthOffset + textOffsetWidth, +(y * boardSize + boardSheetHeightOffset + boardSize / 2 + this.fontSizeToHeightMm(fontSize)).toFixed(2), text);
            }
        }
    }

    usage(doc: jsPDF, usage: Map<string, number>, width: number, height: number, project: Project) {
        const fontSize = 12;
        const usagePerPage = 30;
        const usageLineHeight = 8;
        const cellPadding = 1;
        const maxRef = _.maxBy(Array.from(usage.keys()), key => doc.getStringUnitWidth(key));
        const maxUsage = _.max(Array.from(usage.values()));
        const refWidth = doc.getStringUnitWidth(maxRef) * doc.internal.getFontSize() / doc.internal.scaleFactor + cellPadding * 2;
        const usageWidth = doc.getStringUnitWidth("" + maxUsage) * doc.internal.getFontSize() / doc.internal.scaleFactor + cellPadding * 2;

        doc.setFontSize(fontSize);
        _.chunk(Array.from(usage.entries()).sort(([k1, v1], [k2, v2]) => v2 - v1), usagePerPage).forEach(entries => {
            doc.addPage();
            const usageSheetWidthOffset = (width - refWidth - usageWidth) / 2;
            const usageSheetHeightOffset = (height - entries.length * usageLineHeight) / 2;
            Array.from(entries).forEach(([k, v], idx) => {
                let paletteEntry = getPaletteEntryByColorRef(project.paletteConfiguration.palettes, k);

                doc.rect(usageSheetWidthOffset, usageLineHeight * idx + usageSheetHeightOffset, refWidth, usageLineHeight);
                doc.rect(usageSheetWidthOffset + refWidth, usageLineHeight * idx + usageSheetHeightOffset, usageWidth, usageLineHeight);
                doc.rect(usageSheetWidthOffset + refWidth + usageWidth, usageLineHeight * idx + usageSheetHeightOffset, usageWidth, usageLineHeight);
                
                doc.setFillColor(paletteEntry.color.r,paletteEntry.color.g,paletteEntry.color.b);
                doc.rect(usageSheetWidthOffset + refWidth + usageWidth + usageWidth / 4, usageLineHeight * idx + usageSheetHeightOffset + 1, usageWidth / 2, usageLineHeight -2, 'F');

                doc.setTextColor(0, 0, 0);
                doc.text(usageSheetWidthOffset + cellPadding, usageLineHeight * idx + usageSheetHeightOffset + usageLineHeight / 2 + this.fontSizeToHeightMm(fontSize), k);
                doc.text(usageSheetWidthOffset + refWidth + cellPadding, usageLineHeight * idx + usageSheetHeightOffset + usageLineHeight / 2 + this.fontSizeToHeightMm(fontSize), "" + v);
                
                var symbolWidth = doc.getStringUnitWidth(paletteEntry.symbol) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                if (paletteEntry.color.r + paletteEntry.color.g + paletteEntry.color.b < 128 * 3) {
                    doc.setTextColor(255, 255, 255);
                }
                doc.text(usageSheetWidthOffset + refWidth + usageWidth + usageWidth / 2 - symbolWidth / 2, usageLineHeight * idx + usageSheetHeightOffset + usageLineHeight / 2 + this.fontSizeToHeightMm(fontSize) / 2, "" + paletteEntry.symbol);
            });
        })
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


                doc.setFontSize(project.boardConfiguration.board.exportedFontSize);
                for (let y = 0; y < project.boardConfiguration.board.nbBeadPerRow; y++) {
                    for (let x = 0; x < project.boardConfiguration.board.nbBeadPerRow; x++) {
                        doc.rect(x * beadSize + margin, y * beadSize + beadSheetOffset, beadSize, beadSize);

                        let paletteEntry: PaletteEntry = _.find(_.flatten(project.paletteConfiguration.palettes.map(p => p.entries)), entry => {
                            return entry.color.r == reducedColor[4 * ((y + i * project.boardConfiguration.board.nbBeadPerRow) * project.boardConfiguration.board.nbBeadPerRow * project.boardConfiguration.nbBoardWidth + x + j * project.boardConfiguration.board.nbBeadPerRow)]
                                && entry.color.g == reducedColor[4 * ((y + i * project.boardConfiguration.board.nbBeadPerRow) * project.boardConfiguration.board.nbBeadPerRow * project.boardConfiguration.nbBoardWidth + x + j * project.boardConfiguration.board.nbBeadPerRow) + 1]
                                && entry.color.b == reducedColor[4 * ((y + i * project.boardConfiguration.board.nbBeadPerRow) * project.boardConfiguration.board.nbBeadPerRow * project.boardConfiguration.nbBoardWidth + x + j * project.boardConfiguration.board.nbBeadPerRow) + 2]
                                && entry.color.a == reducedColor[4 * ((y + i * project.boardConfiguration.board.nbBeadPerRow) * project.boardConfiguration.board.nbBeadPerRow * project.boardConfiguration.nbBoardWidth + x + j * project.boardConfiguration.board.nbBeadPerRow) + 3];
                        });
                        if (paletteEntry) {
                            text = paletteEntry.ref;
                            let textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                            let textOffsetWidth = (beadSize - textWidth) / 2;
                            doc.text(x * beadSize + margin + textOffsetWidth, +(y * beadSize + beadSheetOffset + (beadSize - project.boardConfiguration.board.exportedFontSize * 0.35) / 1.5).toFixed(2), text);

                            doc.setFillColor(paletteEntry.color.r, paletteEntry.color.g, paletteEntry.color.b);
                            doc.rect(x * beadSize + margin + beadSize * .1, y * beadSize + beadSheetOffset + beadSize * .6, beadSize - 2 * beadSize * .1, beadSize * .3, 'FD');
                        } else {
                            doc.line(x * beadSize + margin, y * beadSize + beadSheetOffset, x * beadSize + margin + beadSize, y * beadSize + beadSheetOffset + beadSize);
                        }
                    }
                }
            }
        }
    }

    fontSizeToHeightMm(fontSize: number) {
        return (fontSize * 0.35) / 1.5;
    }

}
