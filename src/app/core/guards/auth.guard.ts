import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NotifyService } from '../services/notify.service';
import { UserState } from '../state/user/user.state';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _store: Store,
    private _notify: NotifyService,
  ) {
  }

  canActivate(): Observable<boolean> {
    return this._store.selectOnce(UserState.loggedIn).pipe(
      tap(loggedIn => {
        if (!loggedIn) {
          this._notify.update('You must be logged in!', 'error');
          this._router.navigate(['/login']);
        }
      })
    );
  }
}
