import { Component, Input, OnChanges, ViewChild, SimpleChanges, ElementRef, Output, EventEmitter, OnInit } from "@angular/core";
import { Palette, PaletteEntry } from "../../model/palette/palette.model";
import { ColorToHsl } from '../../model/color/hsl.model';
import { countBeads, removeColorUnderPercent, hasUsageUnderPercent } from "../../utils/utils";

import { Chart } from 'chart.js';
import * as _ from 'lodash';

@Component({
    selector: 'bead-usage',
    templateUrl: './bead-usage.component.html',
    styleUrls: ['./bead-usage.component.scss']
})
export class BeadUsageComponent implements OnChanges {
    @ViewChild('bar', { static: true }) barCanvasTag: ElementRef;
    @ViewChild('polar', { static: true }) polarCanvasTag: ElementRef;

    @Input() usage: Map<string, number>;
    @Input() palettes: Palette[];

    @Output() onPaletteChange = new EventEmitter<void>();

    barChart: Chart;
    polarChart: Chart;

    history: Map<string, number>[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (this.usage.size) {
            const data = this.generateData(this.usage, this.palettes);
            if (this.barChart) {
                this.updateChart(this.barChart, data);
            } else {
                const barCanvasCtx = this.barCanvasTag.nativeElement.getContext('2d');
                this.barChart = new Chart(barCanvasCtx, {
                    type: 'bar',
                    data: data,
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            xAxes: [{
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    autoSkip: false,
                                }
                            }],
                            yAxes: [({
                                type: "linear",
                                barPercentage: .8,
                                categoryPercentage: 1,
                                gridLines: {
                                    display: false
                                },
                            }) as Chart.ChartYAxe]
                        },
                        responsive: true,
                        legend: {
                            display: false
                        },
                        onClick: (event) => {
                            try {
                                this.history.push(_.cloneDeep(this.palettes));
                                const ref = this.barChart.data.labels[(this.barChart.getElementsAtEvent(event)[0] as any)._index];
                                this.findEntry(ref as string, this.palettes).enabled = false;
                                this.onPaletteChange.emit();
                            } catch (e) {
                            }
                        }
                    }
                });
            }

            if (this.polarChart) {
                this.updateChart(this.polarChart, data);
            } else {
                const polarCanvasCtx = this.polarCanvasTag.nativeElement.getContext('2d');
                this.polarChart = new Chart(polarCanvasCtx, {
                    type: 'polarArea',
                    data: data,
                    options: {
                        maintainAspectRatio: false,
                        responsive: true,
                        legend: {
                            display: false
                        },
                        onClick: (event) => {
                            try {
                                this.history.push(_.cloneDeep(this.palettes));
                                const ref = this.polarChart.data.labels[(this.polarChart.getElementsAtEvent(event)[0] as any)._index];
                                this.findEntry(ref as string, this.palettes).enabled = false;
                                this.onPaletteChange.emit();
                            } catch (e) {
                            }
                        }
                    }
                });
            }
        }
    }

    updateChart(chart: Chart, data: Chart.ChartData) {
        chart.data = data;
        chart.update();
    }

    findEntry(ref: string, palettes: Palette[]): PaletteEntry {
        return _(palettes)
            .map(p => p.entries)
            .flatten()
            .find(e => e.ref === ref);
    }

    generateData(usage: Map<string, number>, palettes: Palette[]): Chart.ChartData {
        const data = {
            labels: [],
            datasets: [{
                options: {
                },
                data: [],
                backgroundColor: [],
                borderColor: "#cccccc",
                borderWidth: 1
            }]
        };

        Array.from(usage.entries()).sort(([k1, v1], [k2, v2]) => {
            let e1 = this.findEntry(k1, palettes);
            if (!e1) {
                return
            }
            let e2 = this.findEntry(k2, palettes);
            if (!e2) {
                return
            }
            return ColorToHsl(e1.color).h - ColorToHsl(e2.color).h
        }).forEach(([k, v]) => {
            let e = this.findEntry(k, palettes)
            if (e) {
                data.labels.push(k);
                data.datasets[0].data.push(v);
                data.datasets[0].backgroundColor.push(`rgba(${e.color.r},${e.color.g},${e.color.b},${e.color.a})`);
            }
        });

        return data;
    }

    countBeads(usage: Map<string, number>): number {
        return countBeads(usage);
    }

    undo() {
        _.assign(this.palettes, this.history.pop());
        this.onPaletteChange.emit();
    }

    removeColorUnderPercent(percent: number, usage: Map<string, number>, palettes: Palette[]) {
        this.history.push(_.cloneDeep(this.palettes));
        removeColorUnderPercent(percent, usage, palettes);
        this.onPaletteChange.emit();
    }
    hasUsageUnderPercent = hasUsageUnderPercent;
}
