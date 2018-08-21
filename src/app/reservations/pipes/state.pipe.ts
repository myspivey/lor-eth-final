import { Pipe, PipeTransform } from '@angular/core';

import { Reservation } from '../models/reservation';

@Pipe({
  name: 'state'
})
export class StatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return Reservation.State[value];
  }
}
