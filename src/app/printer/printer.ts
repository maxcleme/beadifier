import { PaletteEntry } from '../model/palette/palette.model';
import { Project } from '../model/project/project.model';

export interface Printer {
    name(): string;
    print(
        reducedColor: Uint8ClampedArray,
        usage: Map<string, number>,
        project: Project,
        filename: string
    ): unknown;
}
