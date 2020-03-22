import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Project } from '../../model/project/project.model';
import { BOARDS, Board } from '../../model/board/board.model';
import { Palette } from '../../model/palette/palette.model';
import { PaletteService } from '../../palette/palette.service';

import * as _ from 'lodash';
import { Observable } from 'rxjs';

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

  constructor(private paletteService: PaletteService) {
    this.availableBoards = _.values(BOARDS);
    this.availablePalettes = paletteService.getAll();
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

  paletteEquality(o1: Palette, o2: Palette) {
    return o1.name == o2.name;
  }

  preventSubmit(e: Event) {
    e.preventDefault();
    return false;
  }
}