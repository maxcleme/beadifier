import { Project } from "../model/project/project.model";
import { PaletteEntry } from "../model/palette/palette.model";

export interface Printer {
    print(reducedColor: Uint8ClampedArray, usage: Map<PaletteEntry, number>, project: Project);
}