import { BrowserModule } from '@angular/platform-browser';
import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';

import { NtkmeButtonModule } from '@ctrl/ngx-github-buttons';

import { MaterialModule } from './app.material.module';

import { AppComponent } from './app.component';
import { ProjectOptionComponent } from './component/project-option/project-option.component';
import { UploadImageButtonComponent } from './component/upload-image-button/upload-image-button.component';
import { BoardConfigurationComponent } from './component/project-option/board/board-configuration.component';
import { PaletteConfigurationComponent } from './component/project-option/palette/palette-configuration.component';
import { ImageConfigurationComponent } from './component/project-option/image/image-configuration.component';
import { DitheringConfigurationComponent } from './component/project-option/dithering/dithering-configuration.component';
import { MatchingConfigurationComponent } from './component/project-option/matching/matching-configuration.component';
import { RendererConfigurationComponent } from './component/project-option/renderer/renderer-configuration.component';
import { BeadUsageComponent } from './component/bead-usage/bead-usage.component';
import { BoardSizeComponent } from './component/board-size/board-size.component';
import { PaletteEntryComponent } from './component/palette-entry/palette-entry.component';
import { ExportComponent } from './component/project-option/export/export.component';

import { PaletteService } from './palette/palette.service';

import { environment } from './../environments/environment';

@NgModule({
    declarations: [
        AppComponent,
        ProjectOptionComponent,
        UploadImageButtonComponent,
        BeadUsageComponent,
        BoardSizeComponent,
        PaletteEntryComponent,
        BoardConfigurationComponent,
        PaletteConfigurationComponent,
        ImageConfigurationComponent,
        DitheringConfigurationComponent,
        MatchingConfigurationComponent,
        RendererConfigurationComponent,
        ExportComponent,
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        MaterialModule,
        NtkmeButtonModule,
        ServiceWorkerModule.register('/ngsw-worker.js', {
            enabled: environment.production,
        }),
    ],
    providers: [PaletteService, provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
