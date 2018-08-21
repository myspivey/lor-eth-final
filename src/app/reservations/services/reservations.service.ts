import { Injectable } from '@angular/core';
import { DecodedLogEntry, ReservationContract, ReservationContractFactory } from '@lor/core/contracts';
import { Web3Service } from '@lor/core/services';

import BigNumber from 'bignumber.js';
import { BehaviorSubject, forkJoin, from, Observable, of, Subject, zip } from 'rxjs';
import { distinctUntilChanged, flatMap, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { IReservation, Reservation } from '../models';

@Injectable()
export class ReservationsService {

  private _reservationFactory: ReservationContractFactory;

  private _setup$ = new BehaviorSubject(false);
  private _isPaused$ = new BehaviorSubject(false);
  private _events$ = new Subject<DecodedLogEntry<{}>>();

  constructor(private _web3service: Web3Service) {
    ReservationContractFactory.createAndValidate(
      _web3service.provider,
      environment.contracts.reservationFactory
    ).then(value => {
      this._reservationFactory = value;
      this._setup$.next(true);
      return _web3service.getLatestBlock();
    }).then(latestBlock => {
      this._reservationFactory
        .PauseEvent({})
        .watch({ fromBlock: latestBlock }, (err, event) => this._isPaused$.next(true));
      this._reservationFactory
        .UnpauseEvent({})
        .watch({ fromBlock: latestBlock }, (err, event) => this._isPaused$.next(false));

      // To make this more performant at scale, filter by current user address
      this._reservationFactory
        .ReservationFactoryCreateEvent({})
        .watch({ fromBlock: latestBlock }, (err, event) => this._events$.next(event));
      this._reservationFactory
        .ReservationFactoryConfirmEvent({})
        .watch({ fromBlock: latestBlock }, (err, event) => this._events$.next(event));
      this._reservationFactory
        .ReservationFactoryActivateEvent({})
        .watch({ fromBlock: latestBlock }, (err, event) => this._events$.next(event));
      this._reservationFactory
        .ReservationFactoryCompleteEvent({})
        .watch({ fromBlock: latestBlock }, (err, event) => this._events$.next(event));
      this._reservationFactory
        .ReservationFactoryCancelEvent({})
        .watch({ fromBlock: latestBlock }, (err, event) => this._events$.next(event));
    });
  }

  get setup$() {
    return this._setup$.pipe(distinctUntilChanged());
  }

  get isPaused$() {
    return this._isPaused$.pipe(distinctUntilChanged());
  }

  get events$() {
    return this._events$;
  }

  createAndSend(reservation: IReservation): Observable<string> {
    const {
      ownerAddress,
      nights,
      rate,
      createdDateTimestamp,
      startDateTimestamp,
      endDateTimestamp
    } = reservation;
    const valueInWei = this._web3service.provider.toWei(reservation.valueInEth, 'ether');

    const transaction = this._reservationFactory.createReservationTx(
      ownerAddress,
      nights,
      new BigNumber(this._web3service.provider.toWei(rate, 'ether')),
      new BigNumber(valueInWei),
      createdDateTimestamp,
      startDateTimestamp,
      endDateTimestamp
    );
    const { gasPrice } = this._web3service.wrapper.getContractDefaults();
    return from(transaction
      .estimateGas({
        gasPrice,
        from: reservation.renterAddress,
        value: this._web3service.provider.toWei(reservation.valueInEth, 'ether'),
      })
      .then((gasEstimate) => {
        return transaction.send({
          gas: gasEstimate, gasPrice,
          from: reservation.renterAddress,
          value: valueInWei,
        });
      })
    );
  }

  updateState(reservation: IReservation, newState: number): Observable<string> {
    let transaction, address;
    switch (newState) {
      case Reservation.State.Confirmed:
        transaction = this._reservationFactory.acceptTx(reservation.id);
        address = reservation.ownerAddress;
        break;
      case Reservation.State.Active:
        transaction = this._reservationFactory.startTx(reservation.id);
        address = reservation.ownerAddress;
        break;
      case Reservation.State.Completed:
        transaction = this._reservationFactory.completeTx(reservation.id);
        address = reservation.renterAddress;
        break;
      case Reservation.State.Canceled:
        transaction = this._reservationFactory.cancelTx(reservation.id);
        address = reservation.ownerAddress;
        break;
    }

    const { gasPrice } = this._web3service.wrapper.getContractDefaults();
    return from(transaction
      .estimateGas({
        gasPrice,
        from: address,
      })
      .then((gasEstimate) => {
        return transaction.send({
          gas: gasEstimate, gasPrice,
          from: address,
        });
      })
    );
  }

  getReservationById(id: string) {
    return from(this._reservationFactory.getReservationById(id));
  }

  getReservationsByUserId(currentUser: string) {
    return from(this._reservationFactory.getReservationsByUserId(currentUser)).pipe(
      flatMap(reservationAddresses =>
        (reservationAddresses.length
          ? forkJoin(reservationAddresses.map(address => this._mapToReservation(address, currentUser)))
          : of<IReservation[]>([])
        )
      ),
    );
  }

  private _mapToReservation(address: string, currentUser: string) {
    return from(ReservationContract.createAndValidate(this._web3service.provider, address)).pipe(
      switchMap(reservation => {
        return zip(
          from(reservation.state),
          from(reservation.data()),
        ).pipe(
          map(([state, data]) => {
            return <IReservation>{
              state: state.toNumber(),
              id: data[0],
              type: Number(data[2].toLowerCase() === currentUser.toLowerCase()), // TODO: Why is this not working without toLowerCase?
              ownerAddress: data[1],
              renterAddress: data[2],
              nights: data[3].toNumber(),
              rate: Number(this._web3service.provider.fromWei(data[4].toNumber(), 'ether')),
              valueInEth: Number(this._web3service.provider.fromWei(data[5].toNumber(), 'ether')),
              createdDateTimestamp: data[6].toNumber(),
              startDateTimestamp: data[7].toNumber(),
              endDateTimestamp: data[8].toNumber(),
              paid: Number(this._web3service.provider.fromWei(data[9].toNumber(), 'ether')),
            };
          })
        );
      }),
    );
  }
}

