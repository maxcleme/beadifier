import * as ld from 'lodash';

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
    @ViewChild('source', { static: true }) imgTag:
        | ElementRef<HTMLImageElement>
        | undefined;
    @ViewChild('canvasContainer', { static: true })
    canvasContainerTag: ElementRef<HTMLDivElement> | undefined;
    @ViewChild('preview', { static: true }) previewTag: ElementRef | undefined;

    availableRenderers: Renderer[];
    renderer: Renderer;
    project: Project | undefined;
    scaler: Scaler;
    aspectRatio: number | undefined;
    usage: Map<string, number>;
    reducedColor: Uint8ClampedArray | undefined;
    beadSize: number;
    loading: boolean;

    constructor(private paletteService: PaletteService) {
        // Rendering technology
        this.availableRenderers = [
            new CanvasWebGLRenderer(),
            new Canvas2dRenderer(),
        ];
        const supportedRenderer = this.availableRenderers.find((renderer) =>
            renderer.isSupported(),
        );
        if (!supportedRenderer) {
            alert(
                'Sorry but your browser seems to not support required features.',
            );
            throw new Error('Could not find a supported renderer');
        }
        this.renderer = supportedRenderer;

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
                new ExportConfiguration(),
            );
        });
    }

    _beadify = ld.debounce(() => {
        this.loading = true;
        new Observable((subscriber) => {
            setTimeout(() => {
                if (!this.canvasContainerTag) {
                    throw new Error('Could not find canvas container element');
                }
                const canvasContainer = this.canvasContainerTag.nativeElement;

                // clear previous canvas if any
                while (canvasContainer.firstChild && canvasContainer.lastChild) {
                    canvasContainer.removeChild(canvasContainer.lastChild);
                }
                if (!this.project) {
                    throw new Error('Project has not initialized');
                }
                const canvas = document.createElement('canvas');
                canvas.style.display = 'none';
                canvas.style.position= 'absolute';
                canvas.style.top ='0px';
                canvas.style.left='0px';
                canvas.width =
                    this.project.boardConfiguration.nbBoardWidth *
                    this.project.boardConfiguration.board.nbBeadPerRow;
                canvas.height =
                    this.project.boardConfiguration.nbBoardHeight *
                    this.project.boardConfiguration.board.nbBeadPerRow;

                canvasContainer.appendChild(canvas);
                if (!this.imgTag) {
                    throw new Error('Could not find image tag');
                }
                const drawingPosition = drawImageInsideCanvas(
                    canvas,
                    this.imgTag.nativeElement,
                    this.project.rendererConfiguration,
                );
                this.reducedColor = reduceColor(
                    canvas,
                    this.project,
                    drawingPosition,
                ).data;
                this.usage = computeUsage(
                    this.reducedColor,
                    this.project.paletteConfiguration.palettes,
                );
                this.renderer.destroy();
                if (!this.previewTag) {
                    throw new Error('Could not find preview tag');
                }
                this.renderer.initContainer(
                    this.previewTag.nativeElement,
                    canvas.width,
                    canvas.height,
                    BEAD_SIZE_PX,
                );
                this.computeAspectRatio();
                this.renderer.render(
                    this.reducedColor,
                    canvas.width,
                    canvas.height,
                    BEAD_SIZE_PX,
                    this.project,
                );
                subscriber.next();
            });
        }).subscribe(() => (this.loading = false));
    }, 250);

    beadify(project: Project) {
        if (!project.image) {
            return;
        }
        if (!this.imgTag) {
            throw new Error('Could not find image tag');
        }

        if (this.imgTag.nativeElement.src !== project.image.src) {
            this.imgTag.nativeElement.src = project.image.src ?? '';
            this.imgTag.nativeElement.addEventListener('load', () => {
                if (!this.project) {
                    throw new Error('Project has not initialized');
                }
                if (!this.imgTag) {
                    throw new Error('Could not find image tag');
                }
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
        if (!this.project) {
            return;
        }
        if (!this.previewTag) {
            throw new Error('Could not find preview tag');
        }
        this.aspectRatio = this.scaler.compute(
            this.project,
            this.previewTag.nativeElement.parentElement.clientWidth,
            this.previewTag.nativeElement.parentElement.clientHeight,
            BEAD_SIZE_PX,
        );
    }
}
