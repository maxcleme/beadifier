import {
    Component,
    Input,
    OnChanges,
    ViewChild,
    SimpleChanges,
    ElementRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { Palette } from '../../model/palette/palette.model';
import { ColorToHsl } from '../../model/color/hsl.model';
import {
    countBeads,
    removeColorUnderPercent,
    hasUsageUnderPercent,
} from '../../utils/utils';

import { Chart } from 'chart.js';
import * as ld from 'lodash';

@Component({
    selector: 'app-bead-usage',
    templateUrl: './bead-usage.component.html',
    styleUrls: ['./bead-usage.component.scss'],
})
export class BeadUsageComponent implements OnChanges {
    @ViewChild('bar', { static: true }) barCanvasTag:
        | ElementRef<HTMLCanvasElement>
        | undefined;
    @ViewChild('polar', { static: true }) polarCanvasTag:
        | ElementRef<HTMLCanvasElement>
        | undefined;

    @Input({ required: true }) usage!: Map<string, number>;
    @Input({ required: true }) palettes!: Palette[];

    @Output() paletteChange = new EventEmitter<void>();

    barChart: Chart | undefined;
    polarChart: Chart | undefined;

    history: Palette[][] = [];
    hasUsageUnderPercent = hasUsageUnderPercent;

    ngOnChanges(_changes: SimpleChanges): void {
        if (this.usage.size) {
            const data = this.generateData(this.usage, this.palettes);
            if (this.barChart) {
                this.updateChart(this.barChart, data);
            } else {
                const barCanvasCtx =
                    this.barCanvasTag?.nativeElement.getContext('2d');
                if (!barCanvasCtx) {
                    throw new Error('Can not get 2d context from bar canvas');
                }
                this.barChart = new Chart(barCanvasCtx, {
                    type: 'bar',
                    data: data,
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            xAxes: [
                                {
                                    gridLines: {
                                        display: false,
                                    },
                                    ticks: {
                                        autoSkip: false,
                                    },
                                },
                            ],
                            yAxes: [
                                {
                                    type: 'linear',
                                    barPercentage: 0.8,
                                    categoryPercentage: 1,
                                    gridLines: {
                                        display: false,
                                    },
                                } as Chart.ChartYAxe,
                            ],
                        },
                        responsive: true,
                        legend: {
                            display: false,
                        },
                        onClick: (event) => {
                            try {
                                this.history.push(ld.cloneDeep(this.palettes));
                                if (!this.barChart) {
                                    throw new Error('Bar chart not defined');
                                }
                                const ref =
                                    this.barChart.data.labels?.[
                                        (
                                            this.barChart.getElementsAtEvent(
                                                event,
                                            )[0] as { _index: number }
                                        )._index
                                    ];
                                const foundEntry = this.findEntry(
                                    ref as string,
                                    this.palettes,
                                );
                                if (foundEntry) {
                                    foundEntry.enabled = false;
                                }
                                this.paletteChange.emit();
                                // eslint-disable-next-line no-empty
                            } catch (_e) {}
                        },
                    },
                });
            }

            if (this.polarChart) {
                this.updateChart(this.polarChart, data);
            } else {
                const polarCanvasCtx =
                    this.polarCanvasTag?.nativeElement.getContext('2d');
                if (!polarCanvasCtx) {
                    throw new Error('No 2d context on polar');
                }
                this.polarChart = new Chart(polarCanvasCtx, {
                    type: 'polarArea',
                    data: data,
                    options: {
                        maintainAspectRatio: false,
                        responsive: true,
                        legend: {
                            display: false,
                        },
                        onClick: (event) => {
                            try {
                                this.history.push(ld.cloneDeep(this.palettes));
                                if (!this.polarChart) {
                                    throw new Error('No polar chart');
                                }
                                const ref =
                                    this.polarChart.data.labels?.[
                                        (
                                            this.polarChart.getElementsAtEvent(
                                                event,
                                            )[0] as { _index: number }
                                        )._index
                                    ];
                                const entry = this.findEntry(
                                    ref as string,
                                    this.palettes,
                                );
                                if (entry) {
                                    entry.enabled = false;
                                }
                                this.paletteChange.emit();
                                // eslint-disable-next-line no-empty
                            } catch (_e) {}
                        },
                    },
                });
            }
        }
    }

    updateChart(chart: Chart, data: Chart.ChartData) {
        chart.data = data;
        chart.update();
    }

    findEntry(ref: string, palettes: Palette[]) {
        return palettes.flatMap((p) => p.entries).find((e) => e.ref === ref);
    }

    generateData(
        usage: Map<string, number>,
        palettes: Palette[],
    ): Chart.ChartData {
        const data = {
            labels: new Array<string>(),
            datasets: [
                {
                    options: {},
                    data: new Array<number>(),
                    backgroundColor: new Array<string>(),
                    borderColor: '#cccccc',
                    borderWidth: 1,
                },
            ],
        };

        Array.from(usage.entries())
            .sort(([k1], [k2]) => {
                const e1 = this.findEntry(k1, palettes);
                if (!e1) {
                    return 0;
                }
                const e2 = this.findEntry(k2, palettes);
                if (!e2) {
                    return 0;
                }
                return ColorToHsl(e1.color).h - ColorToHsl(e2.color).h;
            })
            .forEach(([k, v]) => {
                const e = this.findEntry(k, palettes);
                if (e) {
                    data.labels.push(k);
                    data.datasets[0].data.push(v);
                    data.datasets[0].backgroundColor.push(
                        `rgba(${e.color.r},${e.color.g},${e.color.b},${e.color.a})`,
                    );
                }
            });

        return data;
    }

    countBeads(usage: Map<string, number>): number {
        return countBeads(usage);
    }

    undo() {
        ld.assign(this.palettes, this.history.pop());
        this.paletteChange.emit();
    }

    removeColorUnderPercent(
        percent: number,
        usage: Map<string, number>,
        palettes: Palette[],
    ) {
        this.history.push(ld.cloneDeep(this.palettes));
        removeColorUnderPercent(percent, usage, palettes);
        this.paletteChange.emit();
    }
}
