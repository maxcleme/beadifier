import { BoardConfiguration } from '../configuration/board-configuration.model';
import { PaletteConfiguration } from '../configuration/palette-configuration.model';
import { MatchingConfiguration } from '../configuration/matching-configuration.model';
import { DitheringConfiguration } from '../configuration/dithering-configuration.model';
import { ImageConfiguration } from '../configuration/image-configuration.model';
import { RendererConfiguration } from '../configuration/renderer-configuration.model';
import { ExportConfiguration } from '../configuration/export-configuration.model';
import { LoadImage } from '../image/load-image.model';

export class Project {
    image: LoadImage;
    srcWidth: number | undefined;
    srcHeight: number | undefined;

    boardConfiguration: BoardConfiguration;
    paletteConfiguration: PaletteConfiguration;
    matchingConfiguration: MatchingConfiguration;
    ditheringConfiguration: DitheringConfiguration;
    imageConfiguration: ImageConfiguration;
    rendererConfiguration: RendererConfiguration;
    exportConfiguration: ExportConfiguration;

    constructor(
        paletteConfiguration: PaletteConfiguration,
        boardConfiguration: BoardConfiguration,
        matchingConfiguration: MatchingConfiguration,
        imageConfiguration: ImageConfiguration,
        ditheringConfiguration: DitheringConfiguration,
        rendererConfiguration: RendererConfiguration,
        exportConfiguration: ExportConfiguration
    ) {
        this.paletteConfiguration = paletteConfiguration;
        this.boardConfiguration = boardConfiguration;
        this.matchingConfiguration = matchingConfiguration;
        this.imageConfiguration = imageConfiguration;
        this.ditheringConfiguration = ditheringConfiguration;
        this.rendererConfiguration = rendererConfiguration;
        this.exportConfiguration = exportConfiguration;
        this.image = {name: '',src: null}
    }
}
