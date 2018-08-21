enum Type { Owner, Renter }
enum State { Created, Confirmed, Active, Completed, Canceled }

export interface IReservation {
  id?: string;
  valueInEth?: number;
  renterAddress?: string;
  ownerAddress?: string;
  nights?: number;
  rate?: number;
  createdDateTimestamp?: number;
  startDateTimestamp?: number;
  endDateTimestamp?: number;
  state?: State;
  type?: Type;
  paid?: number;
}
