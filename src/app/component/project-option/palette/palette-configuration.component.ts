import { Observable } from 'rxjs';

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { PaletteService } from '../../../palette/palette.service';
import { PaletteConfiguration } from '../../../model/configuration/palette-configuration.model';
import { Palette } from '../../../model/palette/palette.model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-palette-configuration',
    templateUrl: './palette-configuration.component.html',
    styleUrls: ['./palette-configuration.component.scss'],
})
export class PaletteConfigurationComponent {
    @Input({required: true}) configuration!: PaletteConfiguration;
    @Output() configurationChange = new EventEmitter<PaletteConfiguration>();

    availablePalettes: Observable<Palette[]>;
    enableAllPaletteEntry: Map<string, boolean>;

    constructor(private paletteService: PaletteService) {
        this.availablePalettes = paletteService.getAll();
        this.enableAllPaletteEntry = new Map();

        this.availablePalettes.subscribe((palettes) =>
            palettes.forEach((p) => (this.enableAllPaletteEntry.set(p.name,true))
        ))
    }

    toggleAll(e:MatSlideToggleChange , name:string) {
        this.configuration.palettes.forEach((p) => {
            if (p.name === name) {
                p.entries.forEach((entry) => (entry.enabled = e.checked));
            }
        });
        this.callback();
    }

    paletteEquality(o1: Palette, o2: Palette) {
        return o1.name === o2.name;
    }

    callback() {
        this.configurationChange.emit(this.configuration);
    }
}
