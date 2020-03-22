import { Palette } from "./../palette/palette.model";
import { Board } from "./../board/board.model";
import { digest } from "@angular/compiler/src/i18n/serializers/xmb";
import { Observable } from 'rxjs';

export class Project {
    palette: Palette;
    board: Board;
    nbBoardWidth: number;
    nbBoardHeight: number;
    dithering: boolean;
    imageSrc: string;

    constructor(palette: Palette, board: Board, nbBoardWidth: number, nbBoardHeight: number, dithering: boolean) {
        this.palette = palette;
        this.board = board;
        this.nbBoardWidth = nbBoardWidth;
        this.nbBoardHeight = nbBoardHeight;
        this.dithering = dithering;
    }
}