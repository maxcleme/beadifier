import * as _ from "lodash";

import { Printer } from "../printer";
import { Project } from "../../model/project/project.model";
import { PaletteEntry } from "../../model/palette/palette.model";
import { ColorToHex } from "../../model/color/hex.model";
import { Color } from "../../model/color/color.model";
import * as Excel from "exceljs/dist/exceljs";

export class XlsxPrinter implements Printer {
  name(): string {
    return "XLSX (Beta)";
  }

  styles(usage: Map<string, number>, project: Project): string {
    let styles = "";
    Array.from(usage.keys()).forEach((k) => {
      const paletteEntry = _.find(
        _.flatten(project.paletteConfiguration.palettes.map((p) => p.entries)),
        (entry) => {
          return entry.ref === k;
        }
      );
      if (paletteEntry) {
        let fontColor = "";
        if (
          0.299 * paletteEntry.color.r +
            0.587 * paletteEntry.color.g +
            0.114 * paletteEntry.color.b >
          255 / 2
        ) {
          fontColor = `#000000`;
        } else {
          fontColor = `#FFFFFF`;
        }
        styles += `
				<Style ss:ID="${paletteEntry.ref}">
					<Alignment ss:Horizontal="Center" ss:Vertical="Center"></Alignment>
					<Font ss:Color="${fontColor}"></Font>
					<Interior ss:Color="${ColorToHex(
            paletteEntry.color
          )}" ss:Pattern="Solid"></Interior>
				</Style>
				`;
      }
    });
    return styles;
  }

  patternSheet(reducedColor: Uint8ClampedArray, project: Project): string {
    const height =
      project.boardConfiguration.nbBoardHeight *
      project.boardConfiguration.board.nbBeadPerRow;
    const width =
      project.boardConfiguration.nbBoardWidth *
      project.boardConfiguration.board.nbBeadPerRow;

    // define all cells
    let table = "";
    for (let y = 0; y < height; y++) {
      let cells = "";
      for (let x = 0; x < width; x++) {
        let color = new Color(
          reducedColor[y * width * 4 + x * 4],
          reducedColor[y * width * 4 + x * 4 + 1],
          reducedColor[y * width * 4 + x * 4 + 2],
          reducedColor[y * width * 4 + x * 4 + 3]
        );

        let paletteEntry: PaletteEntry = _.find(
          _.flatten(
            project.paletteConfiguration.palettes.map((p) => p.entries)
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
          cells += `
					<Cell ss:StyleID="${paletteEntry.ref}">
						<Data ss:Type="String">${paletteEntry.ref}</Data>
					</Cell>
					`;
        } else {
          cells += `
					<Cell ss:StyleID="Default">
						<Data ss:Type="String">X</Data>
					</Cell>
					`;
        }
      }
      table += `\n
			<Column ss:Index="1" ss:Width="60"/>
			<Row ss:Height="60">
				${cells}
			</Row>
			`;
    }
    return `<Worksheet ss:Name="Pattern">
			<Table>
				${table}
			</Table>
		</Worksheet>
		`;
  }
  inventorySheet(usage: Map<string, number>, project: Project): string {
    return `<Worksheet ss:Name="Inventory">
			<Table>
			</Table>
		</Worksheet>
		`;
  }

  print(
    reducedColor: Uint8ClampedArray,
    usage: Map<string, number>,
    project: Project,
    filename: string
  ) {
    var workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet("Pattern");

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
        let color = new Color(
          reducedColor[y * width * 4 + x * 4],
          reducedColor[y * width * 4 + x * 4 + 1],
          reducedColor[y * width * 4 + x * 4 + 2],
          reducedColor[y * width * 4 + x * 4 + 3]
        );

        let paletteEntry: PaletteEntry = _.find(
          _.flatten(
            project.paletteConfiguration.palettes.map((p) => p.entries)
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
          row.getCell(x + 1).value = paletteEntry.ref;
          row.getCell(x + 1).font = {
            color: {
              argb:
                0.299 * paletteEntry.color.r +
                  0.587 * paletteEntry.color.g +
                  0.114 * paletteEntry.color.b >
                255 / 2
                  ? "FF000000"
                  : "FFFFFFFF",
            },
          };
          row.getCell(x + 1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: `FF${ColorToHex(paletteEntry.color).substring(1)}`,
            },
          };
          row.getCell(x + 1).border = {
            top: { style: "thin", color: { argb: "FFFFFFFF" } },
            left: { style: "thin", color: { argb: "FFFFFFFF" } },
            bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
            right: { style: "thin", color: { argb: "FFFFFFFF" } },
          };
        } else {
          row.getCell(x + 1).border = {
            diagonal: {
              up: true,
              down: true,
              style: "thin",
              color: { argb: "FF000000" },
            },
            top: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          };
        }
        row.getCell(x + 1).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      }
      row.commit();
    }

    worksheet.properties.defaultRowHeight = 40;
    worksheet.properties.defaultColWidth = 40 / 7.025;

    workbook.xlsx.writeBuffer().then((buffer) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([buffer], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      a.setAttribute("download", `${filename}.xlsx`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    // const data = `<?xml version="1.0"?>
    // <?mso-application progid="Excel.Sheet"?>
    // <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    // 	xmlns:x="urn:schemas-microsoft-com:office:excel"
    // 	xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
    // 	xmlns:html="https://www.w3.org/TR/html401/">

    // 	<Styles>
    // 		<Style ss:ID="Default">
    // 			<Alignment ss:Horizontal="Center" ss:Vertical="Center"></Alignment>
    // 			<Font ss:Color="#000000"></Font>
    // 			<Interior ss:Color="#FFFFFF" ss:Pattern="Solid"></Interior>
    // 		</Style>
    // 		${this.styles(usage, project)}
    // 	</Styles>
    // 	${this.patternSheet(reducedColor, project)}
    // 	${this.inventorySheet(usage, project)}
    // </Workbook>
    // `;

    // // generate & save file
    // const a = document.createElement("a");
    // a.href = URL.createObjectURL(new Blob([data], { type: 'text/xml' }));
    // a.setAttribute("download", `${filename}.xls`);
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
  }
}

function hasBorder(worksheet: any, x, y: number): boolean {
  try {
    return worksheet.getRow(y).getCell(x).border;
  } catch (e) {
    return false;
  }
}
