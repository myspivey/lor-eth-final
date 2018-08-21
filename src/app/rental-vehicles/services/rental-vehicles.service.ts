import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ILorUser } from '../../core/models/lor-user.interface';
import { IRentalVehicle } from '../models';


@Injectable()
export class RentalVehiclesService {

  private _vehiclesCollection: AngularFirestoreCollection<IRentalVehicle>;

  constructor(
    private _afs: AngularFirestore,
    private _afstorage: AngularFireStorage
  ) {
    this._vehiclesCollection = this._afs.collection('rental-vehicles', (ref) => ref.orderBy('created'));
  }

  getAll(): Observable<IRentalVehicle[]> {
    return this._vehiclesCollection.snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          const data = a.payload.doc.data();
          data.imageRef = this._afstorage.ref('rental-vehicles/' + data.imageName);
          data.imageUrl = data.imageRef.getDownloadURL();
          data.owner = this._afs.doc<ILorUser>(data.ownerRef).valueChanges();
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }

  create(payload: IRentalVehicle): Observable<IRentalVehicle> {
    return of(<IRentalVehicle>{});
  }
}
