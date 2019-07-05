import { Component, Input, OnChanges, ViewChild, SimpleChanges, ElementRef, Output, EventEmitter } from "@angular/core";
import { PaletteEntry } from "../../model/palette/palette.model";
import { countBeads } from "../../utils/utils";

import { Chart } from 'chart.js';
import * as _ from 'lodash';

@Component({
    selector: 'bead-usage',
    templateUrl: './bead-usage.component.html',
    styleUrls: ['./bead-usage.component.scss']
})
export class BeadUsageComponent implements OnChanges {
    @ViewChild('chart', {static: true}) canvasTag: ElementRef;
    @Input() usage: Map<PaletteEntry, number>;

    @Output() onPaletteChange = new EventEmitter<void>();

    chart: Chart;

    ngOnChanges(changes: SimpleChanges): void {
        if (this.usage.size) {
            const data = this.generateData(this.usage);
            if (this.chart) {
                this.updateChart(this.chart, data);
            } else {
                const canvasCtx = this.canvasTag.nativeElement.getContext('2d');
                this.chart = new Chart(canvasCtx, {
                    type: 'horizontalBar',
                    data: data,
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            xAxes: [{
                                type: "logarithmic",
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    autoSkip: true,
                                    callback: (value, index, arr) => {
                                        const remain = value / (Math.pow(10, Math.floor(Math.log10(value))));

                                        if (remain === 1 || remain === 2 || remain === 5 || index === 0 || index === arr.length - 1) {
                                            return value;
                                        } else {
                                            return '';
                                        }
                                    }
                                }
                            }],
                            yAxes: [({
                                barPercentage: .8,
                                categoryPercentage: 1,
                                gridLines: {
                                    display: false
                                }
                            }) as Chart.ChartYAxe]
                        },
                        responsive: true,
                        legend: {
                            display: false
                        },
                        onClick: (event) => {
                            try {
                                const refAndName = this.chart.data.labels[(this.chart.getElementsAtEvent(event)[0] as any)._index];
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

        Array.from(usage.entries()).sort(([k1, v1], [k2, v2]) => v2 - v1).forEach(([k, v]) => {
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
        return `${entry.ref} ${entry.name}`;
    }


}
