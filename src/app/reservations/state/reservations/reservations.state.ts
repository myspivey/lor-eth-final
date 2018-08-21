import { LoggerService } from '@lor/core/services';
import { UserState } from '@lor/core/state';
import { Action, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';

import { throwError } from 'rxjs';
import { catchError, first, switchMap, tap } from 'rxjs/operators';

import { IReservation, Reservation } from '../../models';
import { ReservationsService } from '../../services/reservations.service';
import { ReservationsActions } from './reservations.actions';

export interface IStateModel {
  loading: boolean;
  enabled: boolean;
  reservations: IReservation[];
}

const defaults: IStateModel = {
  loading: false,
  enabled: false,
  reservations: []
};

@State<IStateModel>({
  name: 'reservations', defaults
})
export class ReservationsState implements NgxsOnInit {

  // --- SELECTORS ---
  @Selector()
  static loading(state: IStateModel) { return state.loading; }

  @Selector()
  static enabled(state: IStateModel) { return state.enabled; }

  @Selector()
  static reservations(state: IStateModel) {
    return state.reservations;
  }

  @Selector()
  static reservationsAsOwner(state: IStateModel) {
    return state.reservations.filter((r) => (r.type === Reservation.Type.Owner));
  }

  @Selector()
  static reservationsAsRenter(state: IStateModel) {
    return state.reservations.filter((r) => (r.type === Reservation.Type.Renter));
  }

  // --- SETUP ---
  constructor(
    private _logger: LoggerService,
    private _store: Store,
    private _service: ReservationsService,
  ) { }

  ngxsOnInit({ patchState }: StateContext<IStateModel>) {
    this._logger.setNamespace(this.constructor.name);
    this._service.isPaused$.subscribe(paused => patchState({ enabled: !paused }));
    this._service.events$.subscribe(event => (event) ? this._store.dispatch(new ReservationsActions.GetReservations()) : null);
  }

  // --- ACTIONS ---
  @Action(ReservationsActions.GetReservations)
  getReservations({ patchState }: StateContext<IStateModel>) {
    patchState({ loading: true });
    const user = this._store.selectSnapshot(UserState.currentUser);
    return this._service.setup$.pipe(
      first((setup) => setup),
      switchMap(() => this._service.getReservationsByUserId(user.address)),
      tap((results) => this._logger.log('Reservations Loaded', results)),
      tap((results) => patchState({ loading: false, reservations: results })),
      catchError(error => {
        patchState({ loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(ReservationsActions.Create, { cancelUncompleted: false })
  create({ patchState, dispatch }: StateContext<IStateModel>, action: ReservationsActions.Create) {
    patchState({ loading: true });

    return this._service
      .createAndSend(action.payload)
      .pipe(
        tap(() => patchState({ loading: false })),
        catchError(error => {
          patchState({ loading: false });
          return throwError(error);
        }),
      );
  }

  @Action(ReservationsActions.UpdateState, { cancelUncompleted: false })
  updateState({ patchState, dispatch }: StateContext<IStateModel>, action: ReservationsActions.UpdateState) {
    patchState({ loading: true });

    return this._service
      .updateState(action.reservation, action.newState)
      .pipe(
        tap(() => patchState({ loading: false })),
        catchError(error => {
          patchState({ loading: false });
          return throwError(error);
        }),
      );
  }
}
