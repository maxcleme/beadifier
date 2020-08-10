export class Board {
    name: string;
    nbBeadPerRow: number;
    exportedFontSize: number;
    exportedSymbolSize: number;

    constructor(name, nbBeadPerRow, exportedFontSize, exportedSymbolSize) {
        this.name = name;
        this.nbBeadPerRow = nbBeadPerRow;
        this.exportedFontSize = exportedFontSize;
        this.exportedSymbolSize = exportedSymbolSize;
    }
}

export const BOARDS = {
    MIDI: new Board("Midi", 29, 8, 11),
    MINI: new Board("Mini", 57, 3, 5),
    MINI_ARTKAL: new Board("Mini", 50, 3, 5),
}