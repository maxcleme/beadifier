import { Color } from '../color/color.model';
import { ColorToLab } from '../color/lab.model';

export interface Matching {
    name: string
    delta(c1, c2: Color): number;
}

class Euclidean {
    name = "Euclidean";

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
    name = "DeltaE"

    delta(ca, cb: Color): number {
        let l1 = ColorToLab(ca)
        let l2 = ColorToLab(cb)

        let deltaL = l1.l - l2.l;
        let deltaA = l1.a - l2.a;
        let deltaB = l1.b - l2.b;
        let c1 = Math.sqrt(l1.a * l1.a + l1.b * l1.b);
        let c2 = Math.sqrt(l2.a * l2.a + l2.b * l2.b);
        let deltaC = c1 - c2;
        let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
        let sc = 1.0 + 0.045 * c1;
        let sh = 1.0 + 0.015 * c1;
        let deltaLKlsl = deltaL / (1.0);
        let deltaCkcsc = deltaC / (sc);
        let deltaHkhsh = deltaH / (sh);
        let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
        return i < 0 ? 0 : Math.sqrt(i);
    }
}


export const MATCHINGS = {
    EUCLIDEAN: new Euclidean(),
    DELTA_E: new DeltaE()
};