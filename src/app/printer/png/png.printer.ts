import 'canvas2svg';
import * as _ from 'lodash';

import { Printer } from '../printer';
import { Project } from "../../model/project/project.model";
import { SvgPrinter } from '../svg/svg.printer';

export class PngPrinter extends SvgPrinter {

    name(): string {
        return "PNG";
    }

    print(reducedColor: Uint8ClampedArray, usage: Map<string, number>, project: Project, filename: string) {
        let svg = this.drawSVG(reducedColor, usage, project);

        // TODO

        // generate & save file
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
        a.setAttribute("download", `${filename}.svg`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}