import * as _ from 'lodash';

import { Project } from '../../model/project/project.model';
import { SvgPrinter } from '../svg/svg.printer';

export class PngPrinter extends SvgPrinter {
    override name(): string {
        return 'PNG (Beta)';
    }

    override print(
        reducedColor: Uint8ClampedArray,
        usage: Map<string, number>,
        project: Project,
        filename: string
    ) {
        const svg = this.drawSVG(reducedColor, usage, project);

        // TODO
        const canvas = document.createElement('canvas');
        canvas.width = Number.parseInt(svg.getAttribute('width') ?? "0");
        canvas.height = Number.parseInt(svg.getAttribute('height') ?? "0");
        const ctx = canvas.getContext('2d');

        const data = new XMLSerializer().serializeToString(svg);
        const DOMURL: any = window.URL || window.webkitURL || window;
        const img = new Image();
        const url = DOMURL.createObjectURL(
            new Blob([data], { type: 'image/svg+xml' })
        );

        img.onload = function () {
            if(!ctx){
                throw new Error("Could not get 2d context")
            }
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(url);

            const a = document.createElement('a');
            a.href = canvas
                .toDataURL('image/png')
                .replace('image/png', 'octet/stream');
            a.setAttribute('download', `${filename}.png`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        img.src = url;
    }
}
