import { Renderer } from './../renderer';
import { clearNode } from './../../utils/utils';

import { mat4, vec3 } from 'gl-matrix';

import { Project } from '../../model/project/project.model';
import { AugmentedBuffer } from './augmented-buffer';
import { Shape } from './shape';
import { AugmentedProgram } from './augmented-program';
import shaderFs from './shader-fs.glsl';
import shaderVs from './shader-vs.glsl';

export class CanvasWebGLRenderer implements Renderer {
    container: Element | undefined;
    canvas: HTMLCanvasElement | undefined;

    isSupported(): boolean {
        const canvas = document.createElement('canvas');
        return (
            !!window.WebGLRenderingContext &&
            !!(
                canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl')
            )
        );
    }

    initContainer(
        container: Element,
        imageWidth: number,
        imageHeight: number,
        beadSizePx: number,
    ) {
        this.container = container;
        this.canvas = container.ownerDocument.createElement('canvas');
        this.canvas.width = imageWidth * beadSizePx;
        this.canvas.height = imageHeight * beadSizePx;
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
            throw new Error('initContainer have not been called');
        }
        const gl = this.initGL(this.canvas);
        const program = this.initShaders(gl);
        const beadShape = this.initBeadShape(gl);
        const boardShape = this.initBoardShape(gl);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        this.drawScene(
            gl,
            program,
            beadShape,
            boardShape,
            imageWidth,
            imageHeight,
            beadSizePx,
            reducedColor,
            project,
        );
    }

    destroy() {
        if (this.container) {
            clearNode(this.container);
        }
    }

    drawScene(
        gl: WebGLRenderingContext,
        program: AugmentedProgram,
        beadShape: Shape,
        boardShape: Shape,
        width: number,
        height: number,
        beadSizePx: number,
        reducedColor: Uint8ClampedArray,
        project: Project,
    ) {
        const mvMatrix = mat4.create();
        const pMatrix = mat4.create();

        gl.viewport(0, 0, width * beadSizePx, height * beadSizePx);
        gl.clearColor(0.9, 0.9, 0.9, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const wBeadRatio = 1 / width;
        const hBeadRatio = 1 / height;
        const beadScaling = vec3.create();
        vec3.set(beadScaling, wBeadRatio, hBeadRatio, 1);

        let colorIdx = 0;
        for (let y = 1 - hBeadRatio; y >= -1; y -= hBeadRatio * 2) {
            for (let x = -1 + wBeadRatio; x <= 1; x += wBeadRatio * 2) {
                // Retrieve color at this position
                const r = reducedColor[colorIdx++] / 255;
                const g = reducedColor[colorIdx++] / 255;
                const b = reducedColor[colorIdx++] / 255;
                const a = reducedColor[colorIdx++] / 255;

                if (a !== 0) {
                    // Identify
                    mat4.identity(mvMatrix);

                    // Set position
                    mat4.translate(mvMatrix, mvMatrix, [x, y, 0]);

                    // Scale bead size
                    mat4.scale(mvMatrix, mvMatrix, beadScaling);

                    gl.bindBuffer(
                        gl.ARRAY_BUFFER,
                        beadShape.positionBuffer.buffer,
                    );
                    gl.vertexAttribPointer(
                        program.vertexPositionAttribute,
                        beadShape.positionBuffer.itemSize,
                        gl.FLOAT,
                        false,
                        0,
                        0,
                    );

                    gl.bindBuffer(
                        gl.ARRAY_BUFFER,
                        beadShape.colorBuffer.buffer,
                    );
                    gl.uniform4f(program.vertexColorUniform, r, g, b, a);

                    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
                    gl.uniformMatrix4fv(
                        program.mvMatrixUniform,
                        false,
                        mvMatrix,
                    );
                    gl.drawArrays(
                        beadShape.drawingMode,
                        0,
                        beadShape.positionBuffer.numItems,
                    );
                }
            }
        }

        if (project.rendererConfiguration.showGrid) {
            const wBoardRatio =
                wBeadRatio * project.boardConfiguration.board.nbBeadPerRow * 2;
            const hBoardRatio =
                hBeadRatio * project.boardConfiguration.board.nbBeadPerRow * 2;
            const boardScaling = vec3.create();
            vec3.set(boardScaling, wBoardRatio, hBoardRatio, 1);

            for (let y = 0; y < project.boardConfiguration.nbBoardHeight; y++) {
                for (
                    let x = 0;
                    x < project.boardConfiguration.nbBoardWidth;
                    x++
                ) {
                    mat4.identity(mvMatrix);

                    // Set position
                    mat4.translate(mvMatrix, mvMatrix, [
                        -1 + x * wBoardRatio,
                        -1 + y * hBoardRatio,
                        0,
                    ]);

                    // Scale board size
                    mat4.scale(mvMatrix, mvMatrix, boardScaling);

                    gl.bindBuffer(
                        gl.ARRAY_BUFFER,
                        boardShape.positionBuffer.buffer,
                    );
                    gl.vertexAttribPointer(
                        program.vertexPositionAttribute,
                        boardShape.positionBuffer.itemSize,
                        gl.FLOAT,
                        false,
                        0,
                        0,
                    );

                    gl.bindBuffer(
                        gl.ARRAY_BUFFER,
                        boardShape.colorBuffer.buffer,
                    );
                    gl.uniform4f(program.vertexColorUniform, 0.5, 0.5, 0.5, 1);

                    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
                    gl.uniformMatrix4fv(
                        program.mvMatrixUniform,
                        false,
                        mvMatrix,
                    );
                    gl.drawArrays(
                        boardShape.drawingMode,
                        0,
                        boardShape.positionBuffer.numItems,
                    );
                }
            }
        }
    }

    initGL(canvas: HTMLCanvasElement): WebGLRenderingContext {
        const gl =
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');
        if (!gl) {
            alert('WebGL not available on this browser.');
            throw new Error('WebGL not available on this browser');
        }
        return gl as WebGLRenderingContext;
    }

    initShaders(gl: WebGLRenderingContext): AugmentedProgram {
        const fragmentShader = this.initShader(
            gl,
            shaderFs,
            gl.FRAGMENT_SHADER,
        );
        const vertexShader = this.initShader(gl, shaderVs, gl.VERTEX_SHADER);

        const shaderProgram = gl.createProgram();
        if (!shaderProgram) {
            throw new Error('No shader program');
        }
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Could not initialise shaders');
        }

        gl.useProgram(shaderProgram);

        const program = new AugmentedProgram(
            shaderProgram,
            gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            gl.getUniformLocation(shaderProgram, 'uColor'),
            gl.getUniformLocation(shaderProgram, 'uPMatrix'),
            gl.getUniformLocation(shaderProgram, 'uMVMatrix'),
        );
        gl.enableVertexAttribArray(program.vertexPositionAttribute);
        return program;
    }

    initShader(
        gl: WebGLRenderingContext,
        shaderSource: string,
        shaderType: number,
    ): WebGLShader {
        const shader = gl.createShader(shaderType);
        if (!shader) {
            throw new Error('No shader created');
        }
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(
                gl.getShaderInfoLog(shader) ?? 'no shader info log',
            );
        }

        return shader;
    }

    initBoardShape(gl: WebGLRenderingContext): Shape {
        const vertexPositionBuffer = gl.createBuffer();
        const vertexColorBuffer = gl.createBuffer();

        const positionVerticles = [1, 1, -1, 1, -1, -1, 1, -1, 1, 1];

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positionVerticles),
            gl.STATIC_DRAW,
        );

        return new Shape(
            gl.LINE_STRIP,
            new AugmentedBuffer(vertexPositionBuffer, 2, 5),
            new AugmentedBuffer(vertexColorBuffer, 4, 5),
        );
    }

    initBeadShape(gl: WebGLRenderingContext): Shape {
        const vertexPositionBuffer = gl.createBuffer();
        const vertexColorBuffer = gl.createBuffer();

        let positionVerticles: number[] = [];
        for (let i = 0.0; i <= 360; i += 1) {
            // degrees to radians
            const j = (i * Math.PI) / 180;
            // X Y Z
            const vert1 = [Math.sin(j), Math.cos(j)];
            const vert2 = [Math.sin(j) * 0.33, Math.cos(j) * 0.33];
            positionVerticles = positionVerticles.concat(vert1);
            positionVerticles = positionVerticles.concat(vert2);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positionVerticles),
            gl.STATIC_DRAW,
        );

        return new Shape(
            gl.TRIANGLE_STRIP,
            new AugmentedBuffer(
                vertexPositionBuffer,
                2,
                positionVerticles.length / 2,
            ),
            new AugmentedBuffer(
                vertexColorBuffer,
                4,
                positionVerticles.length / 2,
            ),
        );
    }
}
