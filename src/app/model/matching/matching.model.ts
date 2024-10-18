import { Color } from '../color/color.model';
import { ColorToLab } from '../color/lab.model';

export interface Matching {
    name: string;
    delta(c1: Color, c2: Color): number;
}

class Euclidean {
    name = 'Euclidean';

    delta(c1: Color, c2: Color): number {
        return Math.sqrt(
            Math.pow(c1.r - c2.r, 2) +
                Math.pow(c1.g - c2.g, 2) +
                Math.pow(c1.b - c2.b, 2) +
                Math.pow(c1.a - c2.a, 2),
        );
    }
}

class DeltaECIE94 {
    name = 'DeltaE (CIE94)';

    delta(ca: Color, cb: Color): number {
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

class DeltaECIE2000 {
    name = 'DeltaE (CIE2000)';

    degree(radian: number): number {
        return (360 * radian) / (2 * Math.PI);
    }
    radian(degree: number): number {
        return (2 * Math.PI * degree) / 360;
    }

    delta(ca: Color, cb: Color): number {
        const l1 = ColorToLab(ca);
        const l2 = ColorToLab(cb);

        /*
         * All credit goes to G.Sharma himself
         * The following code as dummy as follow :
         * duping each columns found in the Excell test suite into a variable for readability purpose
         * http://www2.ece.rochester.edu/~gsharma/ciede2000/
         */

        const C1 = Math.sqrt(Math.pow(l1.a, 2) + Math.pow(l1.b, 2));
        const C2 = Math.sqrt(Math.pow(l2.a, 2) + Math.pow(l2.b, 2));
        const C_ave = (C1 + C2) / 2;
        const G =
            0.5 *
            (1 -
                Math.sqrt(
                    Math.pow(C_ave, 7) / (Math.pow(C_ave, 7) + Math.pow(25, 7)),
                ));
        const L1p = l1.l;
        const a1p = (1 + G) * l1.a;
        const b1p = l1.b;
        const L2p = l2.l;
        const a2p = (1 + G) * l2.a;
        const b2p = l2.b;
        const C1p = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1p, 2));
        const C2p = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2p, 2));
        const h1p =
            a1p === 0 && b1p === 0
                ? 0
                : b1p >= 0
                  ? this.degree(Math.atan2(b1p, a1p))
                  : this.degree(Math.atan2(b1p, a1p)) + 360;
        const h2p =
            a2p === 0 && b2p === 0
                ? 0
                : b2p >= 0
                  ? this.degree(Math.atan2(b2p, a2p))
                  : this.degree(Math.atan2(b2p, a2p)) + 360;
        const dhCond = h2p - h1p > 180 ? 1 : h2p - h1p < -180 ? 2 : 0;
        const dhp =
            dhCond === 0
                ? h2p - h1p
                : dhCond === 1
                  ? h2p - h1p - 360
                  : h2p + 360 - h1p;
        const dLp = L2p - L1p;
        const dCp = C2p - C1p;
        const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(this.radian(dhp / 2));
        const Lp_ave = (L1p + L2p) / 2;
        const Cp_ave = (C1p + C2p) / 2;
        const h_aveCond =
            C1p * C2p === 0
                ? 3
                : Math.abs(h2p - h1p) <= 180
                  ? 0
                  : h1p + h2p < 360
                    ? 1
                    : 2;
        const hp_ave =
            h_aveCond === 3
                ? h1p + h2p
                : h_aveCond === 0
                  ? (h1p + h2p) / 2
                  : h_aveCond === 1
                    ? 180 + (h1p + h2p) / 2
                    : -180 + (h1p + h2p) / 2;
        const SL =
            1 +
            (0.015 * Math.pow(Lp_ave - 50, 2)) /
                Math.sqrt(20 + Math.pow(Lp_ave - 50, 2));
        const SC = 1 + 0.045 * Cp_ave;
        const T =
            1 -
            0.17 * Math.cos(this.radian(hp_ave - 30)) +
            0.24 * Math.cos(this.radian(2 * hp_ave)) +
            0.32 * Math.cos(this.radian(3 * hp_ave + 6)) -
            0.2 * Math.cos(this.radian(4 * hp_ave - 63));
        const SH = 1 + 0.015 * Cp_ave * T;
        const dTheta = 30 * Math.exp(-1 * Math.pow((hp_ave - 275) / 25, 2));
        const RC =
            2 *
            Math.sqrt(
                Math.pow(Cp_ave, 7) / (Math.pow(Cp_ave, 7) + Math.pow(25, 7)),
            );
        const RT = -1 * Math.sin(this.radian(2 * dTheta)) * RC;

        const KL = 1;
        const KC = 1;
        const KH = 1;

        const deltaE2000 = Math.sqrt(
            Math.pow(dLp / (SL * KL), 2) +
                Math.pow(dCp / (SC * KC), 2) +
                Math.pow(dHp / (SH * KH), 2) +
                RT * (dCp / (SC * KC)) * (dHp / (SH * KH)),
        );
        return deltaE2000;
    }
}

export const MATCHINGS = {
    EUCLIDEAN: new Euclidean(),
    DELTA_E_CIE94: new DeltaECIE94(),
    DELTA_E_CIE2000: new DeltaECIE2000(),
};
