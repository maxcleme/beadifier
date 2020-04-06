import { NgModule } from '@angular/core';

import {
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
  MatDividerModule
} from '@angular/material';

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
    MatDividerModule
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
    MatDividerModule
  ]
})
export class MaterialModule { }