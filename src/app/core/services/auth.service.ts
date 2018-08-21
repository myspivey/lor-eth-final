import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthProvider, FirebaseAuth, User, UserCredential } from '@firebase/auth-types';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, share, switchMap } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';
import { Connect, MNID, SimpleSigner } from 'uport-connect';

import { environment } from '../../../environments/environment';
import { LoggerService } from '../../core/services/logger.service';
import { ILorUser } from '../models/lor-user.interface';
import { NotifyService } from './notify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _currentUser$: Observable<ILorUser | null>;
  private _fbAuth: FirebaseAuth;
  private _uport: Connect;

  constructor(
    private _afAuth: AngularFireAuth,
    private _afs: AngularFirestore,
    private _router: Router,
    private _notify: NotifyService,
    private _logger: LoggerService,
  ) {
    this._uport = new Connect(environment.uport.name,
      {
        network: environment.uport.network,
        clientId: environment.uport.clientId,
        signer: SimpleSigner(environment.uport.signer),
      });
    this._logger.setNamespace(this.constructor.name);
    this._fbAuth = this._afAuth.auth;
    this._currentUser$ = this._afAuth.authState.pipe(
      switchMap(user => {
        return user ? this._afs.doc<ILorUser>(`users/${user.uid}`).valueChanges() : of(null);
      }),
      share(),
    );
  }

  get currentUser$() {
    return this._currentUser$;
  }

  //// Anonymous Auth ////

  // anonymousLogin() {
  //   return this._afAuth.auth
  //     .signInAnonymously()
  //     .then(credential => {
  //       this._notify.update('Welcome to Luxury Offroad Rentals!!!', 'success');
  //       return this._updateUserData(credential.user);
  //     })
  //     .catch(error => {
  //       this._handleError(error);
  //     });
  // }

  //// UPort ////
  uportLogin() {
    // TODO: Currently requestCredentials does not return the JWT which causes real problems for validation on the server
    // https://github.com/uport-project/uport-connect/issues/150
    return from(this._uport.requestCredentials({
      requested: ['name', 'phone', 'avatar', 'email'],
      notifications: true // We want this if we want to receive credentials
    })).pipe(
      switchMap(async (creds: any) => {
        const decodedId = MNID.decode(creds.address);

        delete creds['@context'];
        delete creds['@type'];
        const { data } = await firebase.functions().httpsCallable('verifyUportJwt')(creds);
        const credential = await this._afAuth.auth.signInWithCustomToken(data);
        this._notify.update('Welcome to Luxury Offroad Rentals!!!', 'success');
        return this._mapUserData(credential.user, (environment.production && decodedId.network === '0x4') ? decodedId.address : null);
      }),
      map(() => of(this._router.navigate(['/']))),
      catchError(error => {
        console.error(error);
        return this._handleError(error);
      }),
    );
  }

  //// Email/Password Auth ////

  emailSignUp(email: string, password: string) {
    return from(this._fbAuth.createUserWithEmailAndPassword(email, password)).pipe(
      switchMap((credential: UserCredential) => {
        this._notify.update('Welcome new user!', 'success');
        return this._mapUserData(credential.user);
      }),
      map(() => of(this._router.navigate(['/']))),
      catchError(error => this._handleError(error)),
    );
  }

  emailLogin(email: string, password: string) {
    this._logger.log('emailLogin', email, password);
    return from(this._fbAuth.signInWithEmailAndPassword(email, password)).pipe(
      switchMap((credential: UserCredential) => {
        this._logger.log('emailLogin:success', credential);
        this._notify.update('Welcome back!', 'success');
        return this._mapUserData(credential.user);
      }),
      map(() => of(this._router.navigate(['/']))),
      catchError(error => this._handleError(error)),
    );
  }

  loginProvider(provider: AuthProvider) {
    return from(this._fbAuth.signInWithPopup(provider))
      .pipe(
        switchMap((credential: UserCredential) => {
          this._notify.update('Welcome to Luxury Offroad Rentals!!!', 'success');
          return this._mapUserData(credential.user);
        }),
        map(() => of(this._router.navigate(['/']))),
        catchError(error => this._handleError(error)),
      );
  }

  logout() {
    return of(this._fbAuth.signOut())
      .pipe(
        map(() => of(this._router.navigate(['/'])))
      );
  }

  saveProfile(payload: Partial<ILorUser>) {
    return this._updateUserData(payload);
  }

  callOracle(string: string) {
    // Ensure our string is indeed random
    const randomNumber = Math.floor(Math.random() * 1000) + 1;
    return from(firebase.functions().httpsCallable('validateId')(`${string} + ${randomNumber}`));
  }

  // If error, console log and notify user
  private _handleError(error: Error) {
    this._notify.update(error.message, 'error');
    return throwError(error);
  }

  // Sets user data to firestore after successful login
  private _mapUserData(user: User, address: string = null) {
    const name = user.displayName || 'Anon';
    const email = user.email || null;
    const emailHash = Md5.hashStr(email);

    const data: ILorUser = {
      uid: user.uid,
      email: email,
      displayName: name,
      photoURL: user.photoURL || `https://www.gravatar.com/avatar/${emailHash}?s=200&d=https%3A%2F%2Fui-avatars.com%2Fapi%2F/${name}/200`,
      phoneNumber: user.phoneNumber,
      providerId: user.providerId,
    };

    if (address) {
      data.address = address;
    }
    return this._updateUserData(data);
  }
  private _updateUserData(user: Partial<ILorUser>): Observable<void> {
    return from(this._afs.doc<ILorUser>(`users/${user.uid}`).set(<any>user, { merge: true }));
  }
}
