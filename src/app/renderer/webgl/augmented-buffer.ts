export class AugmentedBuffer {
    buffer: WebGLBuffer | null;
    itemSize: number;
    numItems: number;

    constructor(
        buffer: WebGLBuffer | null,
        itemSize: number,
        numItems: number,
    ) {
        this.buffer = buffer;
        this.itemSize = itemSize;
        this.numItems = numItems;
    }
}
