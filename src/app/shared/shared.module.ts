import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { sharedComponents } from './components';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    ...sharedComponents
  ],
  exports: [
    RouterModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    ...sharedComponents
  ]
})
export class SharedModule { }
