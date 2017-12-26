import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Project } from '../../model/project/project.model';
import { BOARDS, Board } from '../../model/board/board.model';
import { PALETTES, Palette } from '../../model/palette/palette.model';

import * as _ from 'lodash';

@Component({
  selector: 'project-option',
  templateUrl: './project-option.component.html',
  styleUrls: ['./project-option.component.scss']
})
export class ProjectOptionComponent {
  @Input() project: Project;
  @Output() onLoad = new EventEmitter<Project>();

  availableBoards: Board[];
  availablePalettes: Palette[];

  constructor() {
    this.availableBoards = _.values(BOARDS);
    this.availablePalettes = _.values(PALETTES);
  }

  onLoadingImageCallback(src) {
    this.project.imageSrc = src;
    this.callback();
  }

  callback() {
    this.onLoad.emit(this.project);
  }

  resetPalette() {
    this.project.palette.entries.forEach(entry => entry.enabled = true);
    this.callback();
  }

  preventSubmit(e: Event) {
    e.preventDefault();
    return false;
  }
}