import { Renderer } from './../renderer';
import { Color } from './../../model/color/color.model';
import { clearNode } from './../../utils/utils';
import { Project } from '../../model/project/project.model';

export class Canvas2dRenderer implements Renderer {
    container: Element | undefined;
    canvas: HTMLCanvasElement | undefined;

    isSupported(): boolean {
        return true;
    }

    initContainer(
        container: Element,
        _imageWidth: number,
        _imageHeight: number,
        _beadSizePx: number,
    ) {
        this.container = container;
        this.canvas = container.ownerDocument.createElement('canvas');
        container.appendChild(this.canvas);
    }

    render(
        reducedColor: Uint8ClampedArray,
        imageWidth: number,
        imageHeight: number,
        beadSizePx: number,
        project: Project,
    ) {
        if (!this.canvas) {
            throw new Error('Container not initialized');
        }
        this.canvas.width = imageWidth * beadSizePx;
        this.canvas.height = imageHeight * beadSizePx;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2d context');
        }
        ctx.fillStyle = 'rgb(229, 229, 229)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (project.rendererConfiguration.showGrid) {
            ctx.strokeStyle = '#000000';
            for (let y = 0; y < project.boardConfiguration.nbBoardHeight; y++) {
                for (
                    let x = 0;
                    x < project.boardConfiguration.nbBoardWidth;
                    x++
                ) {
                    ctx.strokeRect(
                        x *
                            project.boardConfiguration.board.nbBeadPerRow *
                            beadSizePx,
                        y *
                            project.boardConfiguration.board.nbBeadPerRow *
                            beadSizePx,
                        project.boardConfiguration.board.nbBeadPerRow *
                            beadSizePx,
                        project.boardConfiguration.board.nbBeadPerRow *
                            beadSizePx,
                    );
                }
            }
        }

        for (let y = 0; y < imageHeight; y++) {
            for (let x = 0; x < imageWidth; x++) {
                const color = new Color(
                    reducedColor[y * imageWidth * 4 + x * 4],
                    reducedColor[y * imageWidth * 4 + x * 4 + 1],
                    reducedColor[y * imageWidth * 4 + x * 4 + 2],
                    reducedColor[y * imageWidth * 4 + x * 4 + 3],
                );

                if (color.a === 255) {
                    // Bead color
                    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${
                        color.a / 255
                    })`;
                    ctx.beginPath();
                    ctx.arc(
                        x * beadSizePx + beadSizePx / 2,
                        y * beadSizePx + beadSizePx / 2,
                        beadSizePx / 2,
                        0,
                        2 * Math.PI,
                    );
                    ctx.closePath();
                    ctx.fill();

                    // Bead center
                    ctx.fillStyle = 'rgb(229, 229, 229)';
                    ctx.beginPath();
                    ctx.arc(
                        x * beadSizePx + beadSizePx / 2,
                        y * beadSizePx + beadSizePx / 2,
                        beadSizePx / 6,
                        0,
                        2 * Math.PI,
                    );
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }

    destroy() {
        if (this.container) {
            clearNode(this.container);
        }
    }
}
