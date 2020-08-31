export class AugmentedProgram {
    program: WebGLProgram;
    vertexPositionAttribute: any;
    vertexColorUniform: any;
    pMatrixUniform: any;
    mvMatrixUniform: any;

    constructor(
        program,
        vertexPositionAttribute,
        vertexColorUniform,
        pMatrixUniform,
        mvMatrixUniform
    ) {
        this.program = program;
        this.vertexPositionAttribute = vertexPositionAttribute;
        this.vertexColorUniform = vertexColorUniform;
        this.pMatrixUniform = pMatrixUniform;
        this.mvMatrixUniform = mvMatrixUniform;
    }
}
