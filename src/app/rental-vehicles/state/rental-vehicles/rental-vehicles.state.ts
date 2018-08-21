import { LoggerService } from '@lor/core/services';
import { Action, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';

import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { IRentalVehicle } from '../../models';
import { RentalVehiclesService } from '../../services/rental-vehicles.service';
import { RentalVehiclesActions } from './rental-vehicles.actions';

export interface IStateModel {
  loading: boolean;
  rentalVehicles: IRentalVehicle[];
}

const defaults: IStateModel = {
  loading: false,
  rentalVehicles: []
};

@State<IStateModel>({
  name: 'rentalVehicles', defaults
})
export class RentalVehiclesState implements NgxsOnInit {

  // --- SELECTORS ---
  @Selector()
  static loading(state: IStateModel) { return state.loading; }

  @Selector()
  static rentalVehicles(state: IStateModel) {
    return state.rentalVehicles;
  }

  @Selector()
  static rentalVehicle(state: IStateModel) {
    return (vehicleId) => state.rentalVehicles.find((v) => v.id === vehicleId);
  }

  // --- SETUP ---
  constructor(
    private _logger: LoggerService,
    private _store: Store,
    private _rentalVehicleService: RentalVehiclesService,
  ) { }

  ngxsOnInit(stateContext: StateContext<IStateModel>) {
    this._logger.setNamespace(this.constructor.name);
  }

  // --- ACTIONS ---
  @Action(RentalVehiclesActions.GetAll)
  getAll({ patchState }: StateContext<IStateModel>, action: RentalVehiclesActions.Create) {
    patchState({ loading: true });

    return this._rentalVehicleService
      .getAll()
      .pipe(
        tap((results) => patchState({ loading: false, rentalVehicles: results })),
        catchError(error => {
          patchState({ loading: false });
          return throwError(error);
        }),
    );
  }

  @Action(RentalVehiclesActions.Create, { cancelUncompleted: false })
  create({ patchState, dispatch }: StateContext<IStateModel>, action: RentalVehiclesActions.Create) {
    patchState({ loading: true });

    return this._rentalVehicleService
      .create(action.payload)
      .pipe(
        tap(() => patchState({ loading: false })),
        catchError(error => {
          patchState({ loading: false });
          return throwError(error);
        }),
    );
  }
}
