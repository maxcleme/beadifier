import { Component, Input, OnChanges, ViewChild, SimpleChanges, ElementRef, Output, EventEmitter } from "@angular/core";
import { PaletteEntry } from "../../model/palette/palette.model";
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

    @Input() usage: Map<PaletteEntry, number>;
    @Output() onPaletteChange = new EventEmitter<void>();

    barChart: Chart;
    polarChart: Chart;

    ngOnChanges(changes: SimpleChanges): void {
        if (this.usage.size) {
            const data = this.generateData(this.usage);
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
                                const refAndName = this.barChart.data.labels[(this.barChart.getElementsAtEvent(event)[0] as any)._index];
                                Array.from(this.usage.entries()).filter(([k, v]) => this.generateLabel(k) === refAndName).forEach(([k, v]) => {
                                    k.enabled = false;
                                });
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
                                const refAndName = this.polarChart.data.labels[(this.polarChart.getElementsAtEvent(event)[0] as any)._index];
                                Array.from(this.usage.entries()).filter(([k, v]) => this.generateLabel(k) === refAndName).forEach(([k, v]) => {
                                    k.enabled = false;
                                });
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

    generateData(usage: Map<PaletteEntry, number>): Chart.ChartData {
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

        Array.from(usage.entries()).sort(([k1, v1], [k2, v2]) => ColorToHsl(k2.color).h - ColorToHsl(k1.color).h).forEach(([k, v]) => {
            data.labels.push(this.generateLabel(k));
            data.datasets[0].data.push(v);
            data.datasets[0].backgroundColor.push(`rgba(${k.color.r},${k.color.g},${k.color.b},${k.color.a})`);
        });

        return data;
    }

    countBeads(usage: Map<PaletteEntry, number>): number {
        return countBeads(usage);
    }

    generateLabel(entry: PaletteEntry) {
        return `${entry.ref}`;
    }

    removeColorUnderPercent(percent: number, usage: Map<PaletteEntry, number>) {
        removeColorUnderPercent(percent, usage);
        this.onPaletteChange.emit();
    }
    hasUsageUnderPercent = hasUsageUnderPercent;
}
