import { Component, OnInit } from '@angular/core';
import { LoggerService } from '@lor/core/services';
import { BaseComponent } from '@lor/shared/components';
import { RouterState } from '@ngxs/router-plugin';
import { Select, Store } from '@ngxs/store';

import { Observable } from 'rxjs';

import { IReservation, Reservation } from '../models';
import { ReservationsActions } from '../state/reservations/reservations.actions';
import { ReservationsState } from '../state/reservations/reservations.state';

@Component({
  selector: 'lor-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent extends BaseComponent implements OnInit {

  public Type = Reservation.Type;
  public States = Reservation.State;

  public isCreate = false;

  @Select(ReservationsState.enabled)
  public reservationsEnabled$: Observable<boolean>;

  @Select(ReservationsState.loading)
  public reservationsLoading$: Observable<boolean>;

  @Select(ReservationsState.reservationsAsOwner)
  public reservationsAsOwner$: Observable<IReservation[]>;

  @Select(ReservationsState.reservationsAsRenter)
  public reservationsAsRenter$: Observable<IReservation[]>;

  constructor(
    protected _logger: LoggerService,
    private _store: Store
  ) {
    super(_logger);
  }

  ngOnInit() {
    const routerState = this._store.selectSnapshot(RouterState.state);
    this.isCreate = routerState.url.includes('create');
    this.getReservations();
  }

  getReservations() {
    this._store.dispatch(new ReservationsActions.GetReservations());
  }

  reservationAction(reservation: IReservation, newState: number) {
    this._store.dispatch(new ReservationsActions.UpdateState(reservation, newState));
  }

}
