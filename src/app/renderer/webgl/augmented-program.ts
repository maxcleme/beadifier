export class AugmentedProgram {
    program: WebGLProgram;
    vertexPositionAttribute: GLint;
    vertexColorUniform: WebGLUniformLocation | null;
    pMatrixUniform: WebGLUniformLocation | null;
    mvMatrixUniform: WebGLUniformLocation | null;

    constructor(
        program: WebGLProgram,
        vertexPositionAttribute: GLint,
        vertexColorUniform: WebGLUniformLocation | null,
        pMatrixUniform: WebGLUniformLocation | null,
        mvMatrixUniform: WebGLUniformLocation | null
    ) {
        this.program = program;
        this.vertexPositionAttribute = vertexPositionAttribute;
        this.vertexColorUniform = vertexColorUniform;
        this.pMatrixUniform = pMatrixUniform;
        this.mvMatrixUniform = mvMatrixUniform;
    }
}
