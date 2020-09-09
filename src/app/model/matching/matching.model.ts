import { Color } from '../color/color.model';
import { ColorToLab } from '../color/lab.model';

export interface Matching {
    name: string;
    delta(c1, c2: Color): number;
}

class Euclidean {
    name = 'Euclidean';

    delta(c1, c2: Color): number {
        return Math.sqrt(
            Math.pow(c1.r - c2.r, 2) +
                Math.pow(c1.g - c2.g, 2) +
                Math.pow(c1.b - c2.b, 2) +
                Math.pow(c1.a - c2.a, 2)
        );
    }
}

class DeltaE {
    name = 'DeltaE';

    delta(ca, cb: Color): number {
        const l1 = ColorToLab(ca);
        const l2 = ColorToLab(cb);

        const deltaL = l1.l - l2.l;
        const deltaA = l1.a - l2.a;
        const deltaB = l1.b - l2.b;
        const c1 = Math.sqrt(l1.a * l1.a + l1.b * l1.b);
        const c2 = Math.sqrt(l2.a * l2.a + l2.b * l2.b);
        const deltaC = c1 - c2;
        let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
        const sc = 1.0 + 0.045 * c1;
        const sh = 1.0 + 0.015 * c1;
        const deltaLKlsl = deltaL / 1.0;
        const deltaCkcsc = deltaC / sc;
        const deltaHkhsh = deltaH / sh;
        const i =
            deltaLKlsl * deltaLKlsl +
            deltaCkcsc * deltaCkcsc +
            deltaHkhsh * deltaHkhsh;
        return i < 0 ? 0 : Math.sqrt(i);
    }
}

export const MATCHINGS = {
    EUCLIDEAN: new Euclidean(),
    DELTA_E: new DeltaE(),
};
