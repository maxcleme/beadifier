import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Project } from '../../model/project/project.model';
import { PaletteEntry } from '../../model/palette/palette.model';

import * as _ from 'lodash';

@Component({
    selector: 'app-project-option',
    templateUrl: './project-option.component.html',
    styleUrls: ['./project-option.component.scss'],
})
export class ProjectOptionComponent {
    @Input() project: Project;
    @Input() usage: Map<PaletteEntry, number>;
    @Input() reducedColor: Uint8ClampedArray;
    @Output() onLoad = new EventEmitter<Project>();

    onLoadingImageCallback(image) {
        this.project.image = image;
        this.callback();
    }

    callback() {
        this.onLoad.emit(this.project);
    }

    preventSubmit(e: Event) {
        e.preventDefault();
        return false;
    }
}
