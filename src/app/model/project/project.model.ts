import { Palette } from "./../palette/palette.model";
import { Board } from "./../board/board.model";
import { digest } from "@angular/compiler/src/i18n/serializers/xmb";
import { Observable } from 'rxjs';
import { Matching } from '../matching/matching.model';

export class Project {
    palette: Palette;
    board: Board;
    nbBoardWidth: number;
    nbBoardHeight: number;
    dithering: boolean;
    matching: Matching;
    imageSrc: string;

    constructor(palette: Palette, board: Board, nbBoardWidth: number, nbBoardHeight: number, dithering: boolean, matching: Matching) {
        this.palette = palette;
        this.board = board;
        this.nbBoardWidth = nbBoardWidth;
        this.nbBoardHeight = nbBoardHeight;
        this.dithering = dithering;
        this.matching = matching;
    }
}