import { Component, Input, EventEmitter, Output } from '@angular/core';
import { DitheringConfiguration } from '../../../model/configuration/dithering-configuration.model';

const DEFAULT_HARDNESS = 100;

@Component({
    selector: 'app-dithering-configuration',
    templateUrl: './dithering-configuration.component.html',
    styleUrls: ['./dithering-configuration.component.scss'],
})
export class DitheringConfigurationComponent {
    @Input({required:true}) configuration!: DitheringConfiguration;
    @Output() configurationChange = new EventEmitter<DitheringConfiguration>();


    callback() {
        this.configurationChange.emit(this.configuration);
    }

    resetHardness() {
        this.configuration.hardness = DEFAULT_HARDNESS;
    }
}
