import { Component, Input, EventEmitter, Output } from '@angular/core';

import * as _ from 'lodash';
import { BoardConfiguration } from '../../model/configuration/board-configuration.model';

@Component({
    selector: 'app-board-size',
    templateUrl: './board-size.component.html',
    styleUrls: ['./board-size.component.scss'],
})
export class BoardSizeComponent {
    @Input() configuration: BoardConfiguration;
    @Output() onBoardSizeChange = new EventEmitter<
        BoardConfiguration
    >();

    generateRange(to) {
        return _.range(0, to);
    }

    increaseNbBoardWidth() {
        this.configuration.nbBoardWidth++;
        this.onChangeCallback();
    }
    decreaseNbBoardWidth() {
        this.configuration.nbBoardWidth--;
        this.onChangeCallback();
    }
    increaseNbBoardHeight() {
        this.configuration.nbBoardHeight++;
        this.onChangeCallback();
    }
    decreaseNbBoardHeight() {
        this.configuration.nbBoardHeight--;
        this.onChangeCallback();
    }

    onChangeCallback() {
        this.onBoardSizeChange.emit();
    }
}
