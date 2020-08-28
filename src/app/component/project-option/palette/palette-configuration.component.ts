import { Observable } from 'rxjs';

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { PaletteService } from '../../../palette/palette.service';
import { PaletteConfiguration } from '../../../model/configuration/palette-configuration.model';
import { Palette } from '../../../model/palette/palette.model';

@Component({
    selector: 'app-palette-configuration',
    templateUrl: './palette-configuration.component.html',
    styleUrls: ['./palette-configuration.component.scss'],
})
export class PaletteConfigurationComponent {
    @Input() configuration: PaletteConfiguration;
    @Output() onChange = new EventEmitter<PaletteConfiguration>();

    availablePalettes: Observable<Palette[]>;
    enableAllPaletteEntry: boolean;

    constructor(private paletteService: PaletteService) {
        this.availablePalettes = paletteService.getAll();
        this.enableAllPaletteEntry = true;
    }

    toggleAll(e) {
        this.configuration.palettes.forEach((p) =>
            p.entries.forEach((entry) => (entry.enabled = e.checked))
        );
        this.callback();
    }

    paletteEquality(o1: Palette, o2: Palette) {
        return o1.name === o2.name;
    }

    callback() {
        this.onChange.emit(this.configuration);
    }
}
