import { Component, Input, EventEmitter, Output } from "@angular/core";
import { Project } from "../../model/project/project.model";

import * as _ from 'lodash';

@Component({
    selector: 'board-size',
    templateUrl: './board-size.component.html',
    styleUrls: ['./board-size.component.scss']
})
export class BoardSizeComponent {
    @Input("project") project: Project;

    @Output("onBoardSizeChange") onBoardSizeChange = new EventEmitter<void>();

    generateRange(to) {
        return _.range(0, to);
    }

    increaseNbBoardWidth() {
        this.project.nbBoardWidth++;
        this.onChangeCallback();
    }
    decreaseNbBoardWidth() {
        this.project.nbBoardWidth--;
        this.onChangeCallback();
    }
    increaseNbBoardHeight() {
        this.project.nbBoardHeight++;
        this.onChangeCallback();
    }
    decreaseNbBoardHeight() {
        this.project.nbBoardHeight--;
        this.onChangeCallback();
    }

    onChangeCallback(){
        this.onBoardSizeChange.emit();
    }
}