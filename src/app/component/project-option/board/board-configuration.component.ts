import * as ld from 'lodash';

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { BoardConfiguration } from '../../../model/configuration/board-configuration.model';
import { Board, BOARDS } from '../../../model/board/board.model';

@Component({
    selector: 'app-board-configuration',
    templateUrl: './board-configuration.component.html',
    styleUrls: ['./board-configuration.component.scss'],
})
export class BoardConfigurationComponent {
    @Input({required: true}) configuration!: BoardConfiguration;
    @Input({required:true}) srcWidth!: number;
    @Input({required:true}) srcHeight!: number;

    @Output() configurationChange = new EventEmitter<BoardConfiguration>();

    availableBoards: Board[];

    constructor() {
        this.availableBoards = ld.values(BOARDS);
    }

    maximize() {
        this.configuration.nbBoardWidth = Math.ceil(
            this.srcWidth / this.configuration.board.nbBeadPerRow
        );
        this.configuration.nbBoardHeight = Math.ceil(
            this.srcHeight / this.configuration.board.nbBeadPerRow
        );
        this.callback();
    }

    callback() {
        this.configurationChange.emit(this.configuration);
    }
}
