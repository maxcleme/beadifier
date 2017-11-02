import { Palette } from "./../palette/palette.model";
import { Board } from "./../board/board.model";

export class Project {
    palette: Palette;
    board: Board;
    nbBoardWidth: number;
    nbBoardHeight: number;
    imageSrc: string;

    constructor(palette, board, nbBoardWidth, nbBoardHeight) {
        this.palette = palette;
        this.board = board;
        this.nbBoardWidth = nbBoardWidth;
        this.nbBoardHeight = nbBoardHeight;
    }
}