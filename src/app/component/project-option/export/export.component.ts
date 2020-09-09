import { Component, Input } from '@angular/core';
import { Project } from '../../../model/project/project.model';
import { ExportConfiguration } from '../../../model/configuration/export-configuration.model';
import { Printer } from '../../../printer/printer';
import { PdfPrinter } from '../../../printer/pdf/pdf.printer';
import { SvgPrinter } from '../../../printer/svg/svg.printer';
import { PngPrinter } from '../../../printer/png/png.printer';
import { JpgPrinter } from '../../../printer/jpg/jpg.printer';
import { XlsxPrinter } from '../../../printer/xlsx/xlsx.printer';

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
    @Input() configuration: ExportConfiguration;
    @Input() project: Project;
    @Input() usage: Map<string, number>;
    @Input() reducedColor: Uint8ClampedArray;

    availablePrinters: Printer[];
    printer: Printer;

    constructor() {
        this.availablePrinters = [
            new PdfPrinter(),
            new SvgPrinter(),
            new PngPrinter(),
            new JpgPrinter(),
            new XlsxPrinter(),
        ];
        this.printer = this.availablePrinters[0];
    }

    export() {
        this.printer.print(
            this.reducedColor,
            this.usage,
            this.project,
            `beadifier_${this.project.boardConfiguration.nbBoardWidth}x${this.project.boardConfiguration.nbBoardHeight}`
        );
    }
}
