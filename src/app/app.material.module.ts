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
  MatRadioModule
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
    MatRadioModule
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
    MatRadioModule
  ]
})
export class MaterialModule { }