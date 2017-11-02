export class AugmentedBuffer {
    buffer: WebGLBuffer;
    itemSize: number;
    numItems: number;

    constructor(buffer, itemSize, numItems) {
        this.buffer = buffer;
        this.itemSize = itemSize;
        this.numItems = numItems;
    }
}