import { Component, OnInit } from '@angular/core';
import { ILorUser } from '@lor/core/models';
import { LoggerService } from '@lor/core/services';
import { UserState } from '@lor/core/state/user';
import { Select } from '@ngxs/store';

import { combineLatest, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'lor-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent extends BaseComponent implements OnInit {

  public isEditModal = false;

  @Select(UserState.currentUser)
  public user$: Observable<ILorUser | null>;

  @Select(UserState.ethAccountPrimary)
  public ethAccountPrimary$: Observable<string | null>;

  public addressMismatch = false;

  constructor(
    protected _logger: LoggerService,
  ) {
    super(_logger);
  }

  ngOnInit() {
    combineLatest(
      this.user$,
      this.ethAccountPrimary$
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(([user, ethAccountPrimary]) => {
        if (!!user && !!ethAccountPrimary) {
          this.addressMismatch = user.address !== ethAccountPrimary;
        }
      });
  }
}
