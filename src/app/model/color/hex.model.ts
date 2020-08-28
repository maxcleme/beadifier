import { Color } from './color.model';

export function ColorToHex(c: Color): string {
    return (
        // tslint:disable-next-line: no-bitwise
        '#' + ((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)
    );
}
