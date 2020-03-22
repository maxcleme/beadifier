import { Color } from "./../color/color.model";
import { parsePalette } from "../../utils/utils";



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
    color: Color;
    enabled: boolean = true;

    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}