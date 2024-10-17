import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Project } from '../../model/project/project.model';
import { PaletteEntry } from '../../model/palette/palette.model';

import * as _ from 'lodash';
import { LoadImage } from '../../model/image/load-image.model';

@Component({
    selector: 'app-project-option',
    templateUrl: './project-option.component.html',
    styleUrls: ['./project-option.component.scss'],
})
export class ProjectOptionComponent {
    @Input({required: true}) project!: Project & {image: {name:string}};
    @Input({required: true}) usage!: Map<string, number>;
    @Input({required: true}) reducedColor: Uint8ClampedArray | undefined;
    @Output() onLoad = new EventEmitter<Project>();

    onLoadingImageCallback(image: LoadImage) {
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
