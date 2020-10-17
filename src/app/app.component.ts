import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';

import { PaletteService } from './palette/palette.service';
import { Project } from './model/project/project.model';
import {
    drawImageInsideCanvas,
    reduceColor,
    computeUsage,
} from './utils/utils';
import { Renderer } from './renderer/renderer';
import { Canvas2dRenderer } from './renderer/2d/canvas.2d.renderer';
import { CanvasWebGLRenderer } from './renderer/webgl/canvas.webgl.renderer';

import { Scaler } from './scaler/scaler';
import { FitScreenScaler } from './scaler/fit/fit-screen.scaler';

import { MatchingConfiguration } from './model/configuration/matching-configuration.model';
import { ImageConfiguration } from './model/configuration/image-configuration.model';
import { DitheringConfiguration } from './model/configuration/dithering-configuration.model';
import { RendererConfiguration } from './model/configuration/renderer-configuration.model';
import { PaletteConfiguration } from './model/configuration/palette-configuration.model';
import { BoardConfiguration } from './model/configuration/board-configuration.model';
import { ExportConfiguration } from './model/configuration/export-configuration.model';

const BEAD_SIZE_PX = 10;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    @ViewChild('source', { static: true }) imgTag: ElementRef;
    @ViewChild('canvasContainer', { static: true })
    canvasContainerTag: ElementRef;
    @ViewChild('preview', { static: true }) previewTag: ElementRef;

    availableRenderers: Renderer[];
    renderer: Renderer;
    project: Project;
    scaler: Scaler;
    aspectRatio: number;
    usage: Map<string, number>;
    reducedColor: Uint8ClampedArray;
    beadSize: number;
    loading: boolean;

    constructor(private paletteService: PaletteService) {
        // Rendering technology
        this.availableRenderers = [
            new CanvasWebGLRenderer(),
            new Canvas2dRenderer(),
        ];
        this.renderer = _.find(this.availableRenderers, (renderer) =>
            renderer.isSupported()
        );
        if (!this.renderer) {
            alert(
                'Sorry but your browser seems to not support required features.'
            );
        }

        // Init
        this.usage = new Map();
        this.beadSize = BEAD_SIZE_PX;
        this.scaler = new FitScreenScaler();
        this.loading = false;

        // Default
        paletteService.getAll().subscribe((allPalette) => {
            this.project = new Project(
                new PaletteConfiguration([allPalette[0]]),
                new BoardConfiguration(),
                new MatchingConfiguration(),
                new ImageConfiguration(),
                new DitheringConfiguration(),
                new RendererConfiguration(),
                new ExportConfiguration()
            );
        });
    }

    _beadify = _.debounce(() => {
        this.loading = true;
        new Observable((subscriber) => {
            setTimeout(() => {
                const canvasContainer = this.canvasContainerTag.nativeElement;

                // clear previous canvas if any
                while (canvasContainer.firstChild) {
                    canvasContainer.removeChild(canvasContainer.lastChild);
                }

                const canvas = document.createElement('canvas');
                canvas.width =
                    this.project.boardConfiguration.nbBoardWidth *
                    this.project.boardConfiguration.board.nbBeadPerRow;
                canvas.height =
                    this.project.boardConfiguration.nbBoardHeight *
                    this.project.boardConfiguration.board.nbBeadPerRow;

                canvasContainer.appendChild(canvas);

                const drawingPosition = drawImageInsideCanvas(
                    canvas,
                    this.imgTag.nativeElement,
                    this.project.rendererConfiguration
                );
                this.reducedColor = reduceColor(
                    canvas,
                    this.project,
                    drawingPosition
                ).data;
                this.usage = computeUsage(
                    this.reducedColor,
                    this.project.paletteConfiguration.palettes
                );
                this.renderer.destroy();
                this.renderer.initContainer(
                    this.previewTag.nativeElement,
                    canvas.width,
                    canvas.height,
                    BEAD_SIZE_PX
                );
                this.computeAspectRatio();
                this.renderer.render(
                    this.reducedColor,
                    canvas.width,
                    canvas.height,
                    BEAD_SIZE_PX,
                    this.project
                );
                subscriber.next();
            });
        }).subscribe(() => (this.loading = false));
    }, 250);

    beadify(project: Project) {
        if (!project.image) {
            return;
        }

        if (this.imgTag.nativeElement.src !== project.image.src) {
            this.imgTag.nativeElement.src = project.image.src;
            this.imgTag.nativeElement.addEventListener('load', () => {
                this.project.srcWidth = this.imgTag.nativeElement.width;
                this.project.srcHeight = this.imgTag.nativeElement.height;
                this._beadify();
            });
        } else {
            this._beadify();
        }
    }

    @HostListener('window:resize', ['$event'])
    computeAspectRatio() {
        this.aspectRatio = this.scaler.compute(
            this.project,
            this.previewTag.nativeElement.parentElement.clientWidth,
            this.previewTag.nativeElement.parentElement.clientHeight,
            BEAD_SIZE_PX
        );
    }
}
