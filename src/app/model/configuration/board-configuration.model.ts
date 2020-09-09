import { Board, BOARDS } from '../board/board.model';

export class BoardConfiguration {
    board: Board;
    nbBoardWidth: number;
    nbBoardHeight: number;

    constructor() {
        this.board = BOARDS.MIDI;
        this.nbBoardHeight = 2;
        this.nbBoardWidth = 2;
    }
}
