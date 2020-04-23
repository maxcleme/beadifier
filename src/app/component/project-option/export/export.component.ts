import { Component, Input } from '@angular/core';
import { Project } from '../../../model/project/project.model';
import { PaletteEntry } from '../../../model/palette/palette.model';
import { Printer } from '../../../printer/printer';
import { PdfPrinter } from '../../../printer/pdf/pdf.printer';

@Component({
    selector: 'export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss']
})
export class ExportComponent {
    @Input() project: Project;
    @Input() usage: Map<string, number>;
    @Input() reducedColor: Uint8ClampedArray;

    printer: Printer;

    constructor() {
        this.printer = new PdfPrinter();
    }

    export() {
        this.printer.print(this.reducedColor, this.usage, this.project);
    }
}