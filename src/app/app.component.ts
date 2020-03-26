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

import { AnalyticsService } from './analytics/analytics.service';
import { MATCHINGS } from './model/matching/matching.model';

const BEAD_SIZE_PX = 10;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('source', { static: true }) divTag: ElementRef;
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

  constructor(private analytics: AnalyticsService, private paletteService: PaletteService) {
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
        allPalette[0],
        BOARDS.MIDI,
        2,
        2,
        false,
        MATCHINGS.EUCLIDEAN
      );
    })
    this.scaler = new FitScreenScaler();
    this.grid = false;
    this.centered = true;
  }

  beadify(project: Project) {
    const div = this.divTag.nativeElement;
    const previewContainer = this.previewTag.nativeElement;

    const imgTag = div.ownerDocument.createElement('img');
    imgTag.setAttribute('style', 'display:none');
    imgTag.src = project.imageSrc;

    div.appendChild(imgTag);
    imgTag.addEventListener('load', () => {
      const canvas = this.canvasTag.nativeElement;
      canvas.width = project.nbBoardWidth * project.board.nbBeadPerRow;
      canvas.height = project.nbBoardHeight * project.board.nbBeadPerRow;
      drawImageInsideCanvas(canvas, imgTag, this.centered);
      this.reducedColor = reduceColor(canvas, this.project.palette, this.project.dithering, this.project.matching).data;
      this.usage = this.computeUsage(this.reducedColor, this.project.palette);
      this.renderer.destroy();
      this.renderer.initContainer(previewContainer, canvas.width, canvas.height, BEAD_SIZE_PX);
      this.computeAspectRatio();
      this.renderer.render(this.reducedColor, canvas.width, canvas.height, BEAD_SIZE_PX, project, this.grid);
      clearNode(div);
      this.analytics.track("Beadify", {
        boardType: this.project.board.name,
        nbBoardHeight: this.project.nbBoardHeight,
        nbBoardWidth: this.project.nbBoardWidth,
        paletteName: this.project.palette.name,
        beadsCount: countBeads(this.usage)
      });
    });
  }

  @HostListener('window:resize', ['$event'])
  computeAspectRatio() {
    this.aspectRatio = this.scaler.compute(this.project, this.previewTag.nativeElement.parentElement.clientWidth, this.previewTag.nativeElement.parentElement.clientWidth, BEAD_SIZE_PX);
  }

  removeColorUnderPercent(percent: number, usage: Map<PaletteEntry, number>) {
    this.analytics.track("Automatic color reduction", {
      boardType: this.project.board.name,
      nbBoardHeight: this.project.nbBoardHeight,
      nbBoardWidth: this.project.nbBoardWidth,
      paletteName: this.project.palette.name,
      beadsCount: countBeads(this.usage)
    });
    removeColorUnderPercent(percent, usage);
    this.beadify(this.project);
  }

  exportBeadSheets() {
    this.analytics.track("Export", {
      boardType: this.project.board.name,
      nbBoardHeight: this.project.nbBoardHeight,
      nbBoardWidth: this.project.nbBoardWidth,
      paletteName: this.project.palette.name,
      beadsCount: countBeads(this.usage)
    });
    this.printer.print(this.reducedColor, this.usage, this.project);
  }

  computeUsage = computeUsage;
  hasUsageUnderPercent = hasUsageUnderPercent;
}