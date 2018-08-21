import { DocumentReference, Timestamp } from '@firebase/firestore-types';
import { ILorUser } from '@lor/core/models';

import { AngularFireStorageReference } from 'angularfire2/storage';
import { Observable } from 'rxjs';

export interface IRentalVehicle {
  id: string;
  network: string;
  imageName: string;
  make: string;
  model: string;
  year: number;
  costPerNight: number;
  description: string;
  ownerRef: DocumentReference;
  owner: Observable<ILorUser>;
  created: Timestamp;
  lastUpdated: Timestamp;
  lastRented: Timestamp;
  reservations: any[];
  imageRef: AngularFireStorageReference;
  imageUrl: Observable<string>;
}
