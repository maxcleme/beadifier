import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Palette, PaletteEntry } from '../model/palette/palette.model';

import * as _ from 'lodash';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Color } from '../model/color/color.model';

const BW_PALETTE = new Palette('B&W', [
    new PaletteEntry('White', new Color(255, 255, 255, 255)),
    new PaletteEntry('Black', new Color(0, 0, 0, 255)),
]);

@Injectable()
export class PaletteService {
    private palettes: Map<string, Palette> = new Map();

    constructor(private http: HttpClient) {}

    getAll(): Observable<Palette[]> {
        return forkJoin([
            this.loadPalette('hama', 'H'),
            this.loadPalette('nabbi', 'N'),
            this.loadPalette('artkal_a', 'A', 'Artkal A-2.6MM'),
            this.loadPalette('artkal_c', 'C', 'Artkal C-2.6MM'),
            this.loadPalette('artkal_m', 'M', 'Artkal M-2.6MM'),
            this.loadPalette('artkal_r', 'R', 'Artkal R-5MM'),
            this.loadPalette('artkal_s', 'S', 'Artkal S-5MM'),
            this.loadPalette('perler', 'P').pipe(map(this.perlerTransform)),
            this.loadPalette('perler_mini', 'P', 'Perler Mini').pipe(
                map(this.perlerTransform)
            ),
            this.loadPalette('perler_caps', 'P', 'Perler Caps').pipe(
                map(this.perlerTransform)
            ),
            this.loadPalette('yant', 'Y', 'Yant'),
            this.loadPalette('diamondDotz', 'D', 'Diamond Dotz'),
        ]);
    }

    private perlerTransform(p: Palette): Palette {
        return _.assign({}, p, {
            entries: _(p.entries)
                .map((entry) =>
                    _.assign({}, entry, {
                        ref: `P${(+entry.ref.substring(
                            entry.ref.length - 3
                        )).toLocaleString('en-US', {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                        })}`,
                    })
                )
                .value(),
        });
    }

    private loadPalette(
        name: string,
        prefix: string,
        nameOverride?: string
    ): Observable<Palette> {
        if (this.palettes.has(name)) {
            // already loaded
            return of(this.palettes.get(name));
        }
        return this.http
            .get(`https://beadcolors.eremes.xyz/gen/v3/${name}.csv`, {
                responseType: 'arraybuffer',
            })
            .pipe(
                map((p) => {
                    const decoder = new TextDecoder('utf-8');
                    const entries = _(decoder.decode(p).split('\n'))
                        .map((line) => line.split(','))
                        .filter((cells) => cells.length > 1)
                        .map((cells) => ({
                            ref: cells[0],
                            name: cells[1],
                            symbol: cells[2],
                            color: {
                                r: +cells[3],
                                g: +cells[4],
                                b: +cells[5],
                                a: 255,
                            },
                            prefix: prefix,
                            enabled: true,
                        }))
                        .value();
                    return new Palette(
                        nameOverride || _.capitalize(name),
                        entries
                    );
                })
            );
    }
}
