import { Palette } from "./../palette/palette.model";
import { Board } from "./../board/board.model";
import { Matching } from '../matching/matching.model';
import { DitheringConfiguration } from '../configuration/dithering-configuration.model';
import { ImageConfiguration } from '../configuration/image-configuration.model';
import { MatchingConfiguration } from '../configuration/matching-configuration.model';

export class Project {
    palettes: Palette[];
    board: Board;
    nbBoardWidth: number;
    nbBoardHeight: number;
    imageSrc: string;
    matchingConfiguration: MatchingConfiguration;
    ditheringConfiguration: DitheringConfiguration
    imageConfiguration: ImageConfiguration

    constructor(palettes: Palette[], board: Board, nbBoardWidth: number, nbBoardHeight: number, matchingConfiguration: MatchingConfiguration, imageConfiguration: ImageConfiguration, ditheringConfiguration: DitheringConfiguration) {
        this.palettes = palettes;
        this.board = board;
        this.nbBoardWidth = nbBoardWidth;
        this.nbBoardHeight = nbBoardHeight;
        this.matchingConfiguration = matchingConfiguration;
        this.imageConfiguration = imageConfiguration;
        this.ditheringConfiguration = ditheringConfiguration;
    }
}