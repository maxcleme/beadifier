import { Project } from '../model/project/project.model';

export interface Scaler {
    /**
     * Compute scale value to the rendering canvas
     */
    compute(
        project: Project,
        previewContainerWidth: number,
        previewContainerHeight: number,
        beadSize: number
    ): number;
}
