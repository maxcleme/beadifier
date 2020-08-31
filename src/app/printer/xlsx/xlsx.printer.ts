import * as _ from 'lodash';
import * as Excel from 'exceljs/dist/exceljs';

import { Printer } from '../printer';
import { Project } from '../../model/project/project.model';
import { PaletteEntry } from '../../model/palette/palette.model';
import { ColorToHex } from '../../model/color/hex.model';
import { Color } from '../../model/color/color.model';
import { foreground, getPaletteEntryByColorRef } from '../../utils/utils';

export class XlsxPrinter implements Printer {
    name(): string {
        return 'XLSX (Beta)';
    }

    pattern(workbook, reducedColor: Uint8ClampedArray, project: Project) {
        const worksheet = workbook.addWorksheet('Pattern');

        // define all cells
        const height =
            project.boardConfiguration.nbBoardHeight *
            project.boardConfiguration.board.nbBeadPerRow;
        const width =
            project.boardConfiguration.nbBoardWidth *
            project.boardConfiguration.board.nbBeadPerRow;

        const border = {
            top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
            left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
            bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
            right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        };
        const emptyBorder = {
            diagonal: {
                up: true,
                down: true,
                style: 'thin',
                color: { argb: 'FF000000' },
            },
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
        };
        const alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };
        for (let y = 0; y < height; y++) {
            const row = worksheet.getRow(y + 1);
            for (let x = 0; x < width; x++) {
                const color = new Color(
                    reducedColor[y * width * 4 + x * 4],
                    reducedColor[y * width * 4 + x * 4 + 1],
                    reducedColor[y * width * 4 + x * 4 + 2],
                    reducedColor[y * width * 4 + x * 4 + 3]
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
                    const fg = `FF${ColorToHex(
                        foreground(paletteEntry.color)
                    ).substring(1)}`;
                    const bg = `FF${ColorToHex(paletteEntry.color).substring(
                        1
                    )}`;

                    let text = paletteEntry.ref;
                    if (project.exportConfiguration.useSymbols) {
                        text =
                            (project.paletteConfiguration.palettes.length > 1
                                ? paletteEntry.prefix
                                : '') + paletteEntry.symbol;
                    }
                    row.getCell(x + 1).value = text;
                    row.getCell(x + 1).font = {
                        color: {
                            argb: fg,
                        },
                    };
                    row.getCell(x + 1).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {
                            argb: bg,
                        },
                    };
                    row.getCell(x + 1).border = border;
                } else {
                    row.getCell(x + 1).border = emptyBorder;
                }
                row.getCell(x + 1).alignment = alignment;
            }
        }

        worksheet.properties.defaultRowHeight = 40;
        worksheet.properties.defaultColWidth = 40 / 7.025;
    }

    usage(workbook, usage: Map<string, number>, project: Project) {
        const worksheet = workbook.addWorksheet('Inventory');

        let y = 0;
        const refIdx = 1;
        const symbolIdx = project.exportConfiguration.useSymbols ? 2 : -1;
        const countIdx = project.exportConfiguration.useSymbols ? 3 : 2;

        const border = {
            top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
            left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
            bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
            right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        };
        const alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };

        Array.from(usage.entries())
            .sort(([k1, v1], [k2, v2]) => v2 - v1)
            .forEach(([k, v]) => {
                const row = worksheet.getRow(y + 1);
                const entry = getPaletteEntryByColorRef(
                    project.paletteConfiguration.palettes,
                    k
                );
                const fg = `FF${ColorToHex(foreground(entry.color)).substring(
                    1
                )}`;
                const bg = `FF${ColorToHex(entry.color).substring(1)}`;
                const font = {
                    color: {
                        argb: fg,
                    },
                };
                const fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {
                        argb: bg,
                    },
                };

                row.getCell(refIdx).value = entry.ref;
                row.getCell(refIdx).font = font;
                row.getCell(refIdx).fill = fill;
                row.getCell(refIdx).border = border;
                row.getCell(refIdx).alignment = alignment;

                if (project.exportConfiguration.useSymbols) {
                    const text =
                        (project.paletteConfiguration.palettes.length > 1
                            ? entry.prefix
                            : '') + entry.symbol;
                    row.getCell(symbolIdx).value = text;
                    row.getCell(symbolIdx).font = font;
                    row.getCell(symbolIdx).fill = fill;
                    row.getCell(symbolIdx).border = border;
                    row.getCell(symbolIdx).alignment = alignment;
                }

                row.getCell(countIdx).value = '' + v;
                row.getCell(countIdx).font = font;
                row.getCell(countIdx).fill = fill;
                row.getCell(countIdx).border = border;
                row.getCell(countIdx).alignment = alignment;

                y++;
            });

        worksheet.properties.defaultRowHeight = 40;
        worksheet.properties.defaultColWidth = 40 / 7.025;
    }

    print(
        reducedColor: Uint8ClampedArray,
        usage: Map<string, number>,
        project: Project,
        filename: string
    ) {
        const workbook = new Excel.Workbook();

        this.pattern(workbook, reducedColor, project);
        this.usage(workbook, usage, project);

        workbook.xlsx.writeBuffer().then((buffer) => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(
                new Blob([buffer], {
                    type:
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                })
            );
            a.setAttribute('download', `${filename}.xlsx`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
}
