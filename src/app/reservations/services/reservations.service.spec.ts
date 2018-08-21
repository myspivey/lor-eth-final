import { inject, TestBed } from '@angular/core/testing';

import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReservationsService]
    });
  });

  test('should be created', inject([ReservationsService], (service: ReservationsService) => {
    expect(service).toBeTruthy();
  }));
});
