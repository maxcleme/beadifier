import { Component, Input, EventEmitter, Output } from '@angular/core';
import { DitheringConfiguration } from '../../../model/configuration/dithering-configuration.model';

const DEFAULT_HARDNESS = 100;

@Component({
    selector: 'app-dithering-configuration',
    templateUrl: './dithering-configuration.component.html',
    styleUrls: ['./dithering-configuration.component.scss'],
})
export class DitheringConfigurationComponent {
    @Input() configuration: DitheringConfiguration;
    @Output() onChange = new EventEmitter<DitheringConfiguration>();

    constructor() {}

    callback() {
        this.onChange.emit(this.configuration);
    }

    resetHardness() {
        this.configuration.hardness = DEFAULT_HARDNESS;
    }
}
