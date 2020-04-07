import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Project } from '../../model/project/project.model';
import { BOARDS, Board } from '../../model/board/board.model';
import { Palette } from '../../model/palette/palette.model';
import { PaletteService } from '../../palette/palette.service';
import { Matching, MATCHINGS } from '../../model/matching/matching.model';

import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { MatSliderChange } from '@angular/material';



const DEFAULT_CONTRAST = 100;
const DEFAULT_SATURATION = 100;
const DEFAULT_BRIGHTNESS = 100;
const DEFAULT_GRAYSCALE = 0;


@Component({
  selector: 'project-option',
  templateUrl: './project-option.component.html',
  styleUrls: ['./project-option.component.scss']
})
export class ProjectOptionComponent {
  @Input() project: Project;
  @Output() onLoad = new EventEmitter<Project>();

  availableBoards: Board[];
  availablePalettes: Observable<Palette[]>;
  availableMatchings: Matching[];

  enableAllPaletteEntry: boolean;

  imgSettings: any;
  contrast: number;
  saturation: number;
  brightness: number;
  grayscale: number;

  constructor(private paletteService: PaletteService) {
    this.availableBoards = _.values(BOARDS);
    this.availableMatchings = _.values(MATCHINGS);
    this.availablePalettes = paletteService.getAll();
    this.enableAllPaletteEntry = true;

    this.imgSettings = {};
    this.contrast = DEFAULT_CONTRAST;
    this.saturation = DEFAULT_SATURATION;
    this.brightness = DEFAULT_BRIGHTNESS;
    this.grayscale = DEFAULT_GRAYSCALE;
  }

  onLoadingImageCallback(src) {
    this.project.imageSrc = src;
    this.callback();
  }

  toggleAll(e) {
    this.project.palettes.forEach(p => p.entries.forEach(entry => entry.enabled = e.checked));
    this.callback();
  }

  callback() {
    this.project.imgSettings.filter = _.values(this.imgSettings).join(" ");
    this.onLoad.emit(this.project);
  }

  paletteEquality(o1: Palette, o2: Palette) {
    return o1.name == o2.name;
  }

  preventSubmit(e: Event) {
    e.preventDefault();
    return false;
  }

  setGrayscale(e: MatSliderChange) {
    this.imgSettings.grayscale = `grayscale(${e.value}%)`;
    this.callback();
  }

  resetGrayscale() {
    this.grayscale = DEFAULT_GRAYSCALE;
  }

  setBrightness(e: MatSliderChange) {
    this.imgSettings.brightness = `brightness(${e.value}%)`;
    this.callback();
  }

  resetBrightness() {
    this.brightness = DEFAULT_BRIGHTNESS;
  }

  setContrast(e: MatSliderChange) {
    this.imgSettings.contrast = `contrast(${e.value}%)`;
    this.callback();
  }

  resetContrast() {
    this.contrast = DEFAULT_CONTRAST;
  }

  setSaturation(e: MatSliderChange) {
    this.imgSettings.saturation = `saturate(${e.value}%)`;
    this.callback();
  }

  resetSaturation() {
    this.saturation = DEFAULT_SATURATION;
  }
}