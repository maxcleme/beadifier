import { Project } from "../model/project/project.model";

export interface Printer {
    print(reducedColor: Uint8ClampedArray, usage: Map<string, number>, project: Project);
}