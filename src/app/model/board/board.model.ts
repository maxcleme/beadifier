export class Board {
    name: string;
    nbBeadPerRow: number;

    constructor(name, nbBeadPerRow) {
        this.name = name;
        this.nbBeadPerRow = nbBeadPerRow;
    }
}

export const BOARDS = {
    MIDI: new Board("Midi", 29),
    MINI: new Board("Mini", 57),
    MINI_ARTKAL: new Board("Mini", 50),
}