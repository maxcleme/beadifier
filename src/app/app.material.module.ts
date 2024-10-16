import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    imports: [
        MatButtonModule,
        MatCardModule,
        MatSelectModule,
        MatOptionModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatDividerModule,
        MatTabsModule,
        MatListModule,
        MatSliderModule,
        MatInputModule,
    ],
    exports: [
        MatButtonModule,
        MatCardModule,
        MatSelectModule,
        MatOptionModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatDividerModule,
        MatTabsModule,
        MatListModule,
        MatSliderModule,
        MatInputModule,
    ],
})
export class MaterialModule {}
