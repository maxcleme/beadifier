export class Board {
    name: string;
    nbBeadPerRow: number;
    exportedFontSize: number;

    constructor(name, nbBeadPerRow, exportedFontSize) {
        this.name = name;
        this.nbBeadPerRow = nbBeadPerRow;
        this.exportedFontSize = exportedFontSize;
    }
}

export const BOARDS = {
    MIDI: new Board("Midi", 29, 8),
    MINI: new Board("Mini", 57, 3),
    MINI_ARTKAL: new Board("Mini", 50, 3),
}