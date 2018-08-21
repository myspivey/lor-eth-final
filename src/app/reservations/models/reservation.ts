import { IReservation } from '.';

enum Type { Owner, Renter }
enum State { Created, Confirmed, Active, Completed, Canceled }

export class Reservation implements IReservation {
  static Type = Type;
  static State = State;
  createdDateTimestamp = new Date().getTime();
}
