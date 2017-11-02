import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';


import { Palette, PALETTES, PaletteEntry } from './model/palette/palette.model';
import { Board, BOARDS } from './model/board/board.model';
import { Project } from './model/project/project.model';
import { Color } from './model/color/color.model';
import { drawImageInsideCanvas, reduceColor, parsePalette, clearNode, countBeads, computeUsage, hasUsageUnderPercent, removeColorUnderPercent } from './utils/utils';
import { Renderer } from './renderer/renderer';
import { Canvas2dRenderer } from './renderer/2d/canvas.2d.renderer';
import { CanvasWebGLRenderer } from './renderer/webgl/canvas.webgl.renderer';
import { Printer } from './printer/printer';
import { PdfPrinter } from './printer/pdf/pdf.printer';

import * as _ from 'lodash';
import { Scaler } from './scaler/scaler';
import { FitScreenScaler } from './scaler/fit/fit-screen.scaler';

import { AnalyticsService } from './analytics/analytics.service';

const BEAD_SIZE_PX = 10;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('source') divTag: ElementRef;
  @ViewChild('canvas') canvasTag: ElementRef;
  @ViewChild('preview') previewTag: ElementRef;

  availableRenderers: Renderer[];
  renderer: Renderer;
  project: Project;
  scaler: Scaler;
  aspectRatio: number;
  usage: Map<PaletteEntry, number>;
  grid: boolean;
  reducedColor: Uint8ClampedArray;
  beadSize: number;
  printer: Printer;

  constructor(private analytics: AnalyticsService) {
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
    this.project = new Project(PALETTES.HAMA, BOARDS.MIDI, 2, 2);
    this.scaler = new FitScreenScaler();
    this.grid = false;
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



      drawImageInsideCanvas(canvas, imgTag);
      this.reducedColor = reduceColor(canvas, project.palette);
      this.usage = this.computeUsage(this.reducedColor, project.palette);

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