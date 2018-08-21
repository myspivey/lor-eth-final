import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ILorUser } from '@lor/core/models';
import { UserActions, UserState } from '@lor/core/state/user';
import { Select, Store } from '@ngxs/store';

import { Observable } from 'rxjs';

@Component({
  selector: 'lor-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss']
})
export class UserProfileModalComponent implements OnInit {

  @Output() closed = new EventEmitter<null>();

  @Select(UserState.loading)
  public loading$: Observable<boolean>;

  @Select(UserState.currentUser)
  public user$: Observable<ILorUser>;

  @Select(UserState.ethAccountPrimary)
  public ethAccountPrimary$: Observable<string>;

  public profileForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _store: Store
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.profileForm = this._fb.group({
      'address': ['', [
        Validators.required,
      ]],
      'license': ['']
    });
  }

  onSubmit() {
    const user = this._store.selectSnapshot(UserState.currentUser);
    user.address = this.profileForm.controls['address'].value;
    this._store
      .dispatch(new UserActions.SaveProfile(user, this.profileForm.controls['license'].value))
      .subscribe(() => this.close());
  }

  close() {
    this.closed.emit();
  }

}
