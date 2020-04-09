import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';


import { PaletteEntry } from './model/palette/palette.model';
import { BOARDS } from './model/board/board.model';

import { PaletteService } from './palette/palette.service';
import { Project } from './model/project/project.model';
import { drawImageInsideCanvas, reduceColor, clearNode, countBeads, computeUsage, hasUsageUnderPercent, removeColorUnderPercent } from './utils/utils';
import { Renderer } from './renderer/renderer';
import { Canvas2dRenderer } from './renderer/2d/canvas.2d.renderer';
import { CanvasWebGLRenderer } from './renderer/webgl/canvas.webgl.renderer';
import { Printer } from './printer/printer';
import { PdfPrinter } from './printer/pdf/pdf.printer';

import * as _ from 'lodash';
import { Scaler } from './scaler/scaler';
import { FitScreenScaler } from './scaler/fit/fit-screen.scaler';

import { MATCHINGS } from './model/matching/matching.model';
import { MatchingConfiguration } from './model/configuration/matching-configuration.model';
import { ImageConfiguration } from './model/configuration/image-configuration.model';
import { DitheringConfiguration } from './model/configuration/dithering-configuration.model';

const BEAD_SIZE_PX = 10;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('source', { static: true }) imgTag: ElementRef;
  @ViewChild('canvas', { static: true }) canvasTag: ElementRef;
  @ViewChild('preview', { static: true }) previewTag: ElementRef;

  availableRenderers: Renderer[];
  renderer: Renderer;
  project: Project;
  scaler: Scaler;
  aspectRatio: number;
  usage: Map<PaletteEntry, number>;
  grid: boolean;
  centered: boolean;
  reducedColor: Uint8ClampedArray;
  beadSize: number;
  printer: Printer;

  constructor(private paletteService: PaletteService) {
    // Rendering technology
    this.availableRenderers = [new CanvasWebGLRenderer(), new Canvas2dRenderer()];
    this.renderer = _.find(this.availableRenderers, renderer => renderer.isSupported());
    if (!this.renderer) {
      alert("Sorry but your browser seems to not support required features.");
    }

    // Init
    this.usage = new Map();
    this.beadSize = BEAD_SIZE_PX;
    this.printer = new PdfPrinter();

    // Default
    paletteService.getAll().subscribe(allPalette => {
      this.project = new Project(
        [allPalette[0]],
        BOARDS.MIDI,
        2,
        2,
        new MatchingConfiguration(),
        new ImageConfiguration(),
        new DitheringConfiguration()
      );
    })

    this.scaler = new FitScreenScaler();
    this.grid = false;
    this.centered = true;
  }

  _beadify = _.debounce(() => {
    const canvas = this.canvasTag.nativeElement;
    canvas.width = this.project.nbBoardWidth * this.project.board.nbBeadPerRow;
    canvas.height = this.project.nbBoardHeight * this.project.board.nbBeadPerRow;
    drawImageInsideCanvas(canvas, this.imgTag.nativeElement, this.centered);
    this.reducedColor = reduceColor(canvas, this.project).data;
    this.usage = this.computeUsage(this.reducedColor, this.project.palettes);
    this.renderer.destroy();
    this.renderer.initContainer(this.previewTag.nativeElement, canvas.width, canvas.height, BEAD_SIZE_PX);
    this.computeAspectRatio();
    this.renderer.render(this.reducedColor, canvas.width, canvas.height, BEAD_SIZE_PX, this.project, this.grid);
  }, 250)

  beadify(project: Project) {
    if (!project.imageSrc) {
      return;
    }

    if (this.imgTag.nativeElement.src !== project.imageSrc) {
      this.imgTag.nativeElement.src = project.imageSrc;
      this.imgTag.nativeElement.addEventListener('load', () => this._beadify());
    } else {

      this._beadify();
    }

  }

  @HostListener('window:resize', ['$event'])
  computeAspectRatio() {
    this.aspectRatio = this.scaler.compute(this.project, this.previewTag.nativeElement.parentElement.clientWidth, this.previewTag.nativeElement.parentElement.clientWidth, BEAD_SIZE_PX);
  }

  removeColorUnderPercent(percent: number, usage: Map<PaletteEntry, number>) {
    removeColorUnderPercent(percent, usage);
    this._beadify();
  }

  exportBeadSheets() {
    this.printer.print(this.reducedColor, this.usage, this.project);
  }

  computeUsage = computeUsage;
  hasUsageUnderPercent = hasUsageUnderPercent;
}