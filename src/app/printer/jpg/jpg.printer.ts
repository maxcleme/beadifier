import * as _ from 'lodash';

import { Project } from '../../model/project/project.model';
import { SvgPrinter } from '../svg/svg.printer';

export class JpgPrinter extends SvgPrinter {
    override name(): string {
        return 'JPEG (Beta)';
    }

    override print(
        reducedColor: Uint8ClampedArray,
        usage: Map<string, number>,
        project: Project,
        filename: string,
    ) {
        const svg = this.drawSVG(reducedColor, usage, project);

        // TODO
        const canvas = document.createElement('canvas');
        canvas.width = Number.parseInt(svg.getAttribute('width') ?? '0');
        canvas.height = Number.parseInt(svg.getAttribute('height') ?? '0');
        const ctx = canvas.getContext('2d');

        const data = new XMLSerializer().serializeToString(svg);
        const domUrl = window.URL || window.webkitURL || window;
        const img = new Image();
        const url = domUrl.createObjectURL(
            new Blob([data], { type: 'image/svg+xml' }),
        );

        img.onload = function () {
            if (!ctx) {
                throw new Error(' 2d Context not defined');
            }
            ctx.drawImage(img, 0, 0);
            domUrl.revokeObjectURL(url);

            const a = document.createElement('a');
            a.href = canvas
                .toDataURL('image/jpeg')
                .replace('image/jpeg', 'octet/stream');
            a.setAttribute('download', `${filename}.jpeg`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        img.src = url;
    }
}
