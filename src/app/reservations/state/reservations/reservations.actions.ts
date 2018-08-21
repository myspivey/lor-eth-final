import { IReservation } from '../../models';

export namespace ReservationsActions {
  export enum ActionTypes {
    GET_RESERVATIONS = '[Reservations] Get Reservations',
    CREATE = '[Reservations] Create',
    UPDATE_STATE = '[Reservations] Update State',
  }

  export class GetReservations {
    static readonly type = ActionTypes.GET_RESERVATIONS;
    constructor() { }
  }

  export class Create {
    static readonly type = ActionTypes.CREATE;
    constructor(public readonly payload: IReservation) { }
  }

  export class UpdateState {
    static readonly type = ActionTypes.UPDATE_STATE;
    constructor(public readonly reservation: IReservation, public readonly newState: number) { }
  }
}

