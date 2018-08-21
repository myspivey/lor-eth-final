import { Component, OnInit } from '@angular/core';
import { UserState } from '@lor/core/state';
import { Select } from '@ngxs/store';

import { Observable } from 'rxjs';

import { IRentalVehicle } from '../models';
import { RentalVehiclesState } from '../state/rental-vehicles/rental-vehicles.state';

@Component({
  selector: 'lor-rental-vehicles',
  templateUrl: './rental-vehicles.component.html',
  styleUrls: ['./rental-vehicles.component.scss']
})
export class RentalVehiclesComponent implements OnInit {

  @Select(UserState.loggedIn) loggedIn$: Observable<boolean>;

  @Select(RentalVehiclesState.rentalVehicles) vehicles$: Observable<IRentalVehicle[]>;

  constructor() { }

  ngOnInit() {
  }

}
