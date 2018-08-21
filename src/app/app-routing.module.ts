import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, UnAuthGuard } from '@lor/core/guards';
import { UserLoginComponent } from '@lor/shared/components';

import { RentalVehiclesComponent } from './rental-vehicles/components/rental-vehicles.component';

const routes: Routes = [
  { path: '', component: RentalVehiclesComponent },
  { path: 'login', component: UserLoginComponent, canActivate: [UnAuthGuard] },
  { path: 'reservations', loadChildren: './reservations/reservations.module#ReservationsModule', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
