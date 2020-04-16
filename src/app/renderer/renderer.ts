import { Project } from "../model/project/project.model";

export interface Renderer {
    isSupported: () => boolean;
    initContainer: (container: Element, imageWidth: number, imageHeight: number, beadSizePx: number) => void;
    render: (reducedColor: Uint8ClampedArray, imageWidth: number, imageHeight: number, beadSizePx: number, project: Project) => void;
    destroy: () => void;
}