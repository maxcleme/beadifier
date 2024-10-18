import * as ld from 'lodash';
import {Alignment, Border, Borders, Fill, Workbook} from 'exceljs';

import { Printer } from '../printer';
import { Project } from '../../model/project/project.model';
import { ColorToHex } from '../../model/color/hex.model';
import { Color } from '../../model/color/color.model';
import { foreground, getPaletteEntryByColorRef } from '../../utils/utils';

const cellBorderStyle = { style: 'thin', color: { argb: 'FFFFFFFF' } } satisfies Border;
const emptyCellBorderStyle = {
    style: 'thin',
    color: { argb: 'FF000000' },
} satisfies Border;
const boardBorderStyle = {
    style: 'thick',
    color: { argb: '00000000' },
} satisfies Border;
const border = {
    top: cellBorderStyle,
    left: cellBorderStyle,
    bottom: cellBorderStyle,
    right: cellBorderStyle,
} satisfies Partial<Borders>;
const emptyBorder = {
    diagonal: {
        up: true,
        down: true,
        style: 'thin',
        color: { argb: 'FF000000' },
    },
    top: emptyCellBorderStyle,
    left: emptyCellBorderStyle,
    bottom: emptyCellBorderStyle,
    right: emptyCellBorderStyle,
} satisfies Partial<Borders>;
const alignment = {
    vertical: 'middle',
    horizontal: 'center',
} satisfies Partial<Alignment>;

export class XlsxPrinter implements Printer {
    name(): string {
        return 'XLSX (Beta)';
    }

    pattern(workbook: Workbook, reducedColor: Uint8ClampedArray, project: Project) {
        const worksheet = workbook.addWorksheet('Pattern');

        // define all cells
        const height =
            project.boardConfiguration.nbBoardHeight *
            project.boardConfiguration.board.nbBeadPerRow;
        const width =
            project.boardConfiguration.nbBoardWidth *
            project.boardConfiguration.board.nbBeadPerRow;

        for (let y = 0; y < height; y++) {
            const row = worksheet.getRow(y + 1);
            for (let x = 0; x < width; x++) {
                const cell = row.getCell(x + 1);
                const color = new Color(
                    reducedColor[y * width * 4 + x * 4],
                    reducedColor[y * width * 4 + x * 4 + 1],
                    reducedColor[y * width * 4 + x * 4 + 2],
                    reducedColor[y * width * 4 + x * 4 + 3]
                );

                const paletteEntry = ld.find(
                    ld.flatten(
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
                                : '') + (paletteEntry.symbol ?? '');
                    }
                    cell.value = text;
                    cell.font = {
                        color: {
                            argb: fg,
                        },
                    };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {
                            argb: bg,
                        },
                    };
                    cell.border = border;
                } else {
                    cell.border = emptyBorder;
                }
                cell.alignment = alignment;

                if (y === 0) {
                    cell.border = {
                        ...cell.border,
                        top: boardBorderStyle,
                    };
                }

                if (x === 0) {
                    cell.border = {
                        ...cell.border,
                        left: boardBorderStyle,
                    };
                }
                if (
                    (y + 1) % project.boardConfiguration.board.nbBeadPerRow ===
                    0
                ) {
                    cell.border = {
                        ...cell.border,
                        bottom: boardBorderStyle,
                    };
                }
                if (
                    (x + 1) % project.boardConfiguration.board.nbBeadPerRow ===
                    0
                ) {
                    cell.border = {
                        ...cell.border,
                        right: boardBorderStyle,
                    };
                }
            }
        }

        worksheet.properties.defaultRowHeight = 40;
        worksheet.properties.defaultColWidth = 40 / 7.025;
    }

    usage(workbook: Workbook, usage: Map<string, number>, project: Project) {
        const worksheet = workbook.addWorksheet('Inventory');

        let y = 0;
        const refIdx = 1;
        const symbolIdx = project.exportConfiguration.useSymbols ? 2 : -1;
        const countIdx = project.exportConfiguration.useSymbols ? 3 : 2;

        Array.from(usage.entries())
            .sort(([_k1, v1], [_k2, v2]) => v2 - v1)
            .forEach(([k, v]) => {
                const row = worksheet.getRow(y + 1);
                const entry = getPaletteEntryByColorRef(
                    project.paletteConfiguration.palettes,
                    k
                );
                if(!entry){
                    throw new Error("Could not get pallette entry")
                }
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
                } satisfies Fill;

                row.getCell(refIdx).value = entry.ref;
                row.getCell(refIdx).font = font;
                row.getCell(refIdx).fill = fill;
                row.getCell(refIdx).border = border;
                row.getCell(refIdx).alignment = alignment;

                if (project.exportConfiguration.useSymbols) {
                    const text =
                        (project.paletteConfiguration.palettes.length > 1
                            ? entry.prefix
                            : '') + (entry.symbol ?? '');
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
        const workbook = new Workbook();

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
