import { Color } from "./../color/color.model";

export class Palette {
    name: string;
    entries: PaletteEntry[];

    constructor(name, entries) {
        this.name = name;
        this.entries = entries;
    }
}

export class PaletteEntry {
    name: string;
    ref: string;
    symbol: string;
    color: Color;
    enabled: boolean = true;

    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}