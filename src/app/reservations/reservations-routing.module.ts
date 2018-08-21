import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReservationsComponent } from './components/reservations.component';

const routes: Routes = [
  { path: '', component: ReservationsComponent },
  { path: 'create', component: ReservationsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule { }
