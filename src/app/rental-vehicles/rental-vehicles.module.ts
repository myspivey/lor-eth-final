import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@lor/shared';
import { NgxsModule, Store } from '@ngxs/store';

import { RentalVehiclesComponent } from './components/rental-vehicles.component';
import { RentalVehiclesService } from './services/rental-vehicles.service';
import { RentalVehiclesActions } from './state/rental-vehicles/rental-vehicles.actions';
import { RentalVehiclesState } from './state/rental-vehicles/rental-vehicles.state';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgxsModule.forFeature([RentalVehiclesState]),
  ],
  declarations: [RentalVehiclesComponent],
  providers: [RentalVehiclesService],
})
export class RentalVehiclesModule {
  constructor(
    private _store: Store,
  ) {
    this._store.dispatch(RentalVehiclesActions.GetAll);
  }
}
