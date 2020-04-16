import * as _ from 'lodash';

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { BoardConfiguration } from '../../../model/configuration/board-configuration.model';
import { Board, BOARDS } from '../../../model/board/board.model';

@Component({
    selector: 'board-configuration',
    templateUrl: './board-configuration.component.html',
    styleUrls: ['./board-configuration.component.scss']
})
export class BoardConfigurationComponent {
    @Input() configuration: BoardConfiguration;
    @Input() srcWidth: number;
    @Input() srcHeight: number;

    @Output() onChange = new EventEmitter<BoardConfiguration>();

    availableBoards: Board[];

    constructor() {
        this.availableBoards = _.values(BOARDS);
    }

    maximize(){
        this.configuration.nbBoardWidth = Math.ceil(this.srcWidth / this.configuration.board.nbBeadPerRow) 
        this.configuration.nbBoardHeight = Math.ceil(this.srcHeight / this.configuration.board.nbBeadPerRow)
        this.callback();
    }

    callback() {
        this.onChange.emit(this.configuration)
    }

}