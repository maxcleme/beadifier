import { Palette } from '../palette/palette.model';

export class PaletteConfiguration {
    palettes: Palette[];

    constructor(palettes: Palette[]) {
        this.palettes = palettes;
    }
}
