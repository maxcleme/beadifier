import * as _ from 'lodash';

import { Project } from '../../model/project/project.model';
import { SvgPrinter } from '../svg/svg.printer';

export class JpgPrinter extends SvgPrinter {
    name(): string {
        return 'JPEG (Beta)';
    }

    print(
        reducedColor: Uint8ClampedArray,
        usage: Map<string, number>,
        project: Project,
        filename: string
    ) {
        const svg = this.drawSVG(reducedColor, usage, project);

        // TODO
        const canvas = document.createElement('canvas');
        canvas.width = +svg.getAttribute('width');
        canvas.height = +svg.getAttribute('height');
        const ctx = canvas.getContext('2d');

        const data = new XMLSerializer().serializeToString(svg);
        const DOMURL: any = window.URL || window.webkitURL || window;
        const img = new Image();
        const url = DOMURL.createObjectURL(
            new Blob([data], { type: 'image/svg+xml' })
        );

        img.onload = function () {
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(url);

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
