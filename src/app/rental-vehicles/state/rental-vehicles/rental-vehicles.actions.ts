import { IRentalVehicle } from '../../models';

export namespace RentalVehiclesActions {
  export enum ActionTypes {
    GET_ALL = '[RentalVehicles] Get All',
    CREATE = '[RentalVehicles] Create',
  }

  export class GetAll {
    static readonly type = ActionTypes.GET_ALL;
    constructor() { }
  }

  export class Create {
    static readonly type = ActionTypes.CREATE;
    constructor(public readonly payload: IRentalVehicle) {}
  }
}

