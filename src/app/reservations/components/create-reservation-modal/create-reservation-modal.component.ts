import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ILorUser } from '@lor/core/models';
import { LoggerService, Web3Service } from '@lor/core/services';
import { UserState } from '@lor/core/state';
import { BaseComponent } from '@lor/shared/components';
import { RouterState } from '@ngxs/router-plugin';
import { Select, Store } from '@ngxs/store';

import { combineLatest, Observable } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { IRentalVehicle } from '../../../rental-vehicles/models';
import { RentalVehiclesState } from '../../../rental-vehicles/state/rental-vehicles/rental-vehicles.state';
import { IReservation, Reservation } from '../../models';
import { ReservationsActions } from '../../state/reservations/reservations.actions';
import { ReservationsState } from '../../state/reservations/reservations.state';

@Component({
  selector: 'lor-create-reservation-modal',
  templateUrl: './create-reservation-modal.component.html',
  styleUrls: ['./create-reservation-modal.component.scss']
})
export class CreateReservationModalComponent extends BaseComponent implements OnInit {
  @Select(ReservationsState.loading)
  public loading$: Observable<boolean>;

  @Select(UserState.currentUser)
  public user$: Observable<ILorUser>;

  @Select(UserState.ethAccountPrimary)
  public ethAccountPrimary$: Observable<string>;

  public today: Date = new Date();
  public vehicle: IRentalVehicle;
  public reservation: IReservation;

  public totalNights: number;
  public totalCost: number;

  public addressMismatch = false;

  public currentAccountBalance$: Observable<string>;

  public reservationForm: FormGroup;

  constructor(
    protected _logger: LoggerService,
    private _web3Service: Web3Service,
    private _router: Router,
    private _fb: FormBuilder,
    private _store: Store
  ) {
    super(_logger);
  }

  ngOnInit() {
    const routerState = this._store.selectSnapshot(RouterState.state);
    if (routerState.root.queryParams) {
      const vehicleId = routerState.root.queryParams.vehicle;
      this.reservation = new Reservation();
      this.vehicle = this._store.selectSnapshot(RentalVehiclesState.rentalVehicle)(vehicleId);
      this.reservation.rate = Number(this.vehicle.costPerNight);

      this.vehicle.owner.pipe(first()).subscribe((owner) => {
        this.reservation.ownerAddress = owner.address;
      });

      combineLatest(
        this.user$,
        this.ethAccountPrimary$
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe(([user, ethAccountPrimary]) => {
          if (!user.address || !ethAccountPrimary) {
            return;
          }
          // I am doing this here on each create to ensure we always have the latest balance
          this.currentAccountBalance$ = this._web3Service.getAccountBalance(user.address);
          this.addressMismatch = user.address !== ethAccountPrimary;
          this.reservation.renterAddress = ethAccountPrimary;
        });
    }

    this.buildForm();
  }

  buildForm() {
    this.reservationForm = this._fb.group({
      'startDate': ['', [
        Validators.required,
      ]],
      'endDate': ['', [
        Validators.required,
      ]],
    });

    this.reservationForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      if (data.startDate && data.endDate) {
        this.totalNights = Math.round((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (this.totalNights < 1) {
          this.reservationForm.patchValue({ endDate: '' });
          this.totalCost = this.totalNights = null;
        } else {
          this.totalCost = this.totalNights * this.vehicle.costPerNight;
          this.reservation.startDateTimestamp = data.startDate.getTime();
          this.reservation.endDateTimestamp = data.endDate.getTime();
          this.reservation.nights = this.totalNights;
          this.reservation.valueInEth = this.totalCost;
        }
      }
    });
  }

  get startDateValue() {
    return this.reservationForm.value['startDate'];
  }

  get endDateValue() {
    return this.reservationForm.value['endDate'];
  }

  onSubmit() {
    this._store
      .dispatch(new ReservationsActions.Create(this.reservation))
      .subscribe(() => this.close());
  }

  close() {
    this._router.navigate(['/reservations']);
  }

}
