import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { UserState } from '../state/user/user.state';

@Injectable({
  providedIn: 'root'
})
export class UnAuthGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _store: Store,
  ) {
  }

  canActivate(): Observable<boolean> {
    return this._store.selectOnce(UserState.loggedIn).pipe(
      tap(loggedIn => {
        if (loggedIn) {
          this._router.navigate(['/']);
        }
      }),
      map(loggedIn => !loggedIn),
    );
  }
}
