import { Component } from '@angular/core';
import { ILorUser } from '@lor/core/models';
import { UserActions } from '@lor/core/state';
import { UserState } from '@lor/core/state/user';
import { Select, Store } from '@ngxs/store';

import { Observable } from 'rxjs';

@Component({
  selector: 'lor-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {

  show = false;

  @Select(UserState.currentUser)
  public user$: Observable<ILorUser | null>;

  constructor(private _store: Store) { }

  toggleCollapse() {
    this.show = !this.show;
  }

  logout() {
    this._store.dispatch(UserActions.Logout);
  }

}
