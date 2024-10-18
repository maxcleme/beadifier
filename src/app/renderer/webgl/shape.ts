import { AugmentedBuffer } from './augmented-buffer';

export class Shape {
    drawingMode: number;
    positionBuffer: AugmentedBuffer;
    colorBuffer: AugmentedBuffer;

    constructor(
        drawingMode: number,
        positionBuffer: AugmentedBuffer,
        colorBuffer: AugmentedBuffer,
    ) {
        this.drawingMode = drawingMode;
        this.positionBuffer = positionBuffer;
        this.colorBuffer = colorBuffer;
    }
}
