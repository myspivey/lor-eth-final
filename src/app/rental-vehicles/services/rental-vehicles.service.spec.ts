import { inject, TestBed } from '@angular/core/testing';

import { snapshotChanges } from 'angularfire2/database';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';

import { RentalVehiclesService } from './rental-vehicles.service';

describe('RentalVehiclesService', () => {
  const mockSnapshotChanges = jest.fn();
  const mockCollection = jest.fn(() => ({ snapshotChanges: mockSnapshotChanges }));
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RentalVehiclesService,
        { provide: AngularFirestore, useValue: { collection: mockCollection } },
        { provide: AngularFireStorage, useValue: {} }
      ]
    });
  });

  test('should be created', inject([RentalVehiclesService], (service: RentalVehiclesService) => {
    expect(service).toBeTruthy();
  }));
});
