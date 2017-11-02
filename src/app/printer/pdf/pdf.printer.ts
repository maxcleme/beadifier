import { Printer } from './../printer';
import { PaletteEntry } from '../../model/palette/palette.model';
import { Project } from '../../model/project/project.model';

import * as jsPDF from 'jsPdf';
import * as _ from 'lodash';

export class PdfPrinter implements Printer {

    print(reducedColor: Uint8ClampedArray, usage: Map<PaletteEntry, number>, project: Project) {
        const height = 297;
        const width = 210;
        const margin = 5;

        let doc: jsPDF = new jsPDF();
        this.boardMapping(doc, project, margin, width, height);
        this.usage(doc, usage, width, height);
        this.beadMapping(doc, project, reducedColor, width, height, margin);

        doc.save(`beadifier_${project.palette.name}_${project.nbBoardWidth}x${project.nbBoardHeight}.pdf`)
    }

    boardMapping(doc: jsPDF, project: Project, margin: number, width: number, height: number) {
        const boardSize = Math.min((width - margin * 2) / project.nbBoardHeight, (width - margin * 2) / project.nbBoardWidth);
        const boardSheetWidthOffset = (width - boardSize * project.nbBoardWidth) / 2;
        const boardSheetHeightOffset = (height - boardSize * project.nbBoardHeight) / 2;
        const fontSize = 12;

        doc.setFontSize(fontSize);
        for (let y = 0; y < project.nbBoardHeight; y++) {
            for (let x = 0; x < project.nbBoardWidth; x++) {
                doc.rect(x * boardSize + boardSheetWidthOffset, y * boardSize + boardSheetHeightOffset, boardSize, boardSize);

                let text = `${y} - ${x}`;
                let textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                let textOffsetWidth = (boardSize - textWidth) / 2;
                doc.text(x * boardSize + boardSheetWidthOffset + textOffsetWidth, (y * boardSize + boardSheetHeightOffset + boardSize / 2 + this.fontSizeToHeightMm(fontSize)).toFixed(2), text);
            }
        }
    }

    usage(doc: jsPDF, usage: Map<PaletteEntry, number>, width: number, height: number) {
        const fontSize = 12;
        const usagePerPage = 30;
        const generateName = (paletteEntry: PaletteEntry) => `${paletteEntry.ref} ${paletteEntry.name}`;
        const usageLineHeight = 8;
        const cellPadding = 1;
        const maxRef = _.maxBy(Array.from(usage.keys()), key => doc.getStringUnitWidth(generateName(key)));
        const maxUsage = _.max(Array.from(usage.values()));
        const refWidth = doc.getStringUnitWidth(generateName(maxRef)) * doc.internal.getFontSize() / doc.internal.scaleFactor + cellPadding * 2;
        const usageWidth = doc.getStringUnitWidth("" + maxUsage) * doc.internal.getFontSize() / doc.internal.scaleFactor + cellPadding * 2;
        
        doc.setFontSize(fontSize);
        _.chunk(Array.from(usage.entries()), usagePerPage).forEach(entries => {
            doc.addPage();
            const usageSheetWidthOffset = (width - refWidth - usageWidth) / 2;
            const usageSheetHeightOffset = (height - entries.length * usageLineHeight) / 2;
            Array.from(entries).sort(([k1, v1], [k2, v2]) => v2 - v1).forEach(([k, v], idx) => {
                doc.rect(usageSheetWidthOffset, usageLineHeight * idx + usageSheetHeightOffset, refWidth, usageLineHeight);
                doc.rect(usageSheetWidthOffset + refWidth, usageLineHeight * idx + usageSheetHeightOffset, usageWidth, usageLineHeight);
                doc.text(usageSheetWidthOffset + cellPadding, usageLineHeight * idx + usageSheetHeightOffset + usageLineHeight / 2 + this.fontSizeToHeightMm(fontSize), generateName(k));
                doc.text(usageSheetWidthOffset + refWidth + cellPadding, usageLineHeight * idx + usageSheetHeightOffset + usageLineHeight / 2 + this.fontSizeToHeightMm(fontSize), "" + v);
            });
        })
    }

    beadMapping(doc: jsPDF, project: Project, reducedColor: Uint8ClampedArray, width: number, height: number, margin: number) {
        const beadSize = (width - margin * 2) / project.board.nbBeadPerRow;
        const beadSheetOffset = (height - beadSize * project.board.nbBeadPerRow) / 2;

        for (let i = 0; i < project.nbBoardHeight; i++) {
            for (let j = 0; j < project.nbBoardWidth; j++) {
                doc.addPage();
                doc.setFontSize(24);
                let text = `${i} - ${j}`;
                let textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                let textOffset = (doc.internal.pageSize.width - textWidth) / 2;
                doc.text(textOffset, margin * 2, text);


                doc.setFontSize(project.board.exportedFontSize);
                for (let y = 0; y < project.board.nbBeadPerRow; y++) {
                    for (let x = 0; x < project.board.nbBeadPerRow; x++) {
                        doc.rect(x * beadSize + margin, y * beadSize + beadSheetOffset, beadSize, beadSize);

                        let paletteEntry: PaletteEntry = _.find(project.palette.entries, entry => {
                            return entry.color.r == reducedColor[4 * ((y + i * project.board.nbBeadPerRow) * project.board.nbBeadPerRow * project.nbBoardWidth + x + j * project.board.nbBeadPerRow)]
                                && entry.color.g == reducedColor[4 * ((y + i * project.board.nbBeadPerRow) * project.board.nbBeadPerRow * project.nbBoardWidth + x + j * project.board.nbBeadPerRow) + 1]
                                && entry.color.b == reducedColor[4 * ((y + i * project.board.nbBeadPerRow) * project.board.nbBeadPerRow * project.nbBoardWidth + x + j * project.board.nbBeadPerRow) + 2]
                                && entry.color.a == reducedColor[4 * ((y + i * project.board.nbBeadPerRow) * project.board.nbBeadPerRow * project.nbBoardWidth + x + j * project.board.nbBeadPerRow) + 3];
                        });
                        if (paletteEntry) {
                            text = paletteEntry.ref;
                            let textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
                            let textOffsetWidth = (beadSize - textWidth) / 2;
                            doc.text(x * beadSize + margin + textOffsetWidth, (y * beadSize + beadSheetOffset + (beadSize - project.board.exportedFontSize * 0.35) / 1.5).toFixed(2), text);

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