import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '@lor/core/services';
import { UserState } from '@lor/core/state/user';
import { Select } from '@ngxs/store';

import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponent } from '../base/base.component';

type UserFields = 'email' | 'password';
type FormErrors = { [u in UserFields]: string };
interface Credentials { email: string; password: string; }

@Component({
  selector: 'lor-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent extends BaseComponent implements OnInit {
  @Output()
  public userSubmit: EventEmitter<Credentials> = new EventEmitter<Credentials>();

  @Select(UserState.loading)
  public loading$: Observable<boolean>;

  public userForm: FormGroup;
  public formErrors: FormErrors = {
    'email': '',
    'password': '',
  };

  private _validationMessages = {
    'email': {
      'required': 'Email is required.',
      'email': 'Email must be a valid email',
    },
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 4 characters long.',
      'maxlength': 'Password cannot be more than 40 characters long.',
    },
  };

  constructor(
    protected _logger: LoggerService,
    private _fb: FormBuilder,
  ) {
    super(_logger);
  }

  ngOnInit() {
    this.buildForm();
  }

  onSubmit() {
    this.userSubmit.emit({ email: this.userForm.value['email'], password: this.userForm.value['password'] });
  }

  buildForm() {
    this.userForm = this._fb.group({
      'email': ['', [
        Validators.required,
        Validators.email,
      ]],
      'password': ['', [
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
      ]],
    });

    this.userForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => this._onValueChanged(data));
    this._onValueChanged(); // reset validation messages
  }

  // Updates validation state on form changes.
  private _onValueChanged(data?: any) {
    if (!this.userForm) { return; }
    const form = this.userForm;
    for (const field in this.formErrors) {
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'password')) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this._validationMessages[field];
          if (control.errors) {
            for (const key in control.errors) {
              if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                this.formErrors[field] += `${(messages as { [key: string]: string })[key]} `;
              }
            }
          }
        }
      }
    }
  }
}
