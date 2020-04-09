import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Palette, PaletteEntry } from '../model/palette/palette.model';

import * as _ from 'lodash';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Color } from '../model/color/color.model';


@Injectable()
export class PaletteService {

    private palettes: Map<string, Palette> = new Map();

    constructor(private http: HttpClient) { }

    getAll(): Observable<Palette[]> {
        return forkJoin([
            this.loadPalette("hama"),
            this.loadPalette("nabbi"),
            this.loadPalette("artkal_a", "Artkal A-2.6MM"),
            this.loadPalette("artkal_c", "Artkal C-2.6MM"),
            this.loadPalette("artkal_r", "Artkal R-5MM"),
            this.loadPalette("artkal_s", "Artkal S-5MM"),
            this.loadPalette("perler")
                .pipe(
                    map(
                        p => _.assign({}, p, {
                            entries: _(p.entries)
                                .map(entry => _.assign({}, entry, {
                                    ref: `P${(+entry.ref.substring(entry.ref.length - 3)).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`,
                                }))
                                .value()
                        })
                    ),
                ),
        ]);
    }


    private loadPalette(name: string, nameOverride?: string): Observable<Palette> {
        if (this.palettes.has(name)) {
            // already loaded
            return of(this.palettes.get(name));
        }
        return this.http.get(`https://beadcolors.eremes.xyz/gen/v1/${name}.csv`, { responseType: 'arraybuffer' })
            .pipe(
                map(p => {
                    let decoder = new TextDecoder("utf-8");
                    let entries = _(decoder.decode(p).split("\n"))
                        .map(line => line.split(","))
                        .filter(cells => cells.length > 1)
                        .map(cells => ({
                            ref: cells[0],
                            name: cells[1],
                            color: {
                                r: +cells[2],
                                g: +cells[3],
                                b: +cells[4],
                                a: 255,
                            },
                            enabled: true
                        }))
                        .value();
                    return new Palette(nameOverride || _.capitalize(name), entries);
                })
            );
    }
}