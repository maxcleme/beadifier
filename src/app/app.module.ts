import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from './app.material.module';

import { AppComponent } from './app.component';
import { ProjectOptionComponent } from './component/project-option/project-option.component';
import { UploadImageButtonComponent } from './component/upload-image-button/upload-image-button.component';
import { BeadUsageComponent } from './component/bead-usage/bead-usage.component';
import { BoardSizeComponent } from './component/board-size/board-size.component';
import { PaletteEntryComponent } from './component/palette-entry/palette-entry.component';

import { AnalyticsService } from './analytics/analytics.service';

@NgModule({
  declarations: [
    AppComponent,
    ProjectOptionComponent,
    UploadImageButtonComponent,
    BeadUsageComponent,
    BoardSizeComponent,
    PaletteEntryComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,

    FormsModule,
    
    MaterialModule
  ],
  providers: [AnalyticsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
