import { Component } from '@angular/core';
import { firebase } from '@firebase/app';
import { AuthProvider } from '@firebase/auth-types';
import { UserActions } from '@lor/core/state/user';
import { Store } from '@ngxs/store';


@Component({
  selector: 'lor-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent {

  public newUser = false;

  constructor(
    private _store: Store,
  ) { }

  // uPort
  signInWithuPort() {
    this._store.dispatch(new UserActions.LoginUport());
  }

  /// Email Login/Signup
  onUserSubmit(creds: { email: string, password: string }) {
    this._store.dispatch(
      this.newUser
        ? new UserActions.SignupEmail(creds.email, creds.password)
      : new UserActions.LoginEmail(creds.email, creds.password));
  }

  /// Social Login

  signInWithGithub() {
    this._dispatchLogin(new firebase.auth.GithubAuthProvider());
  }

  signInWithGoogle() {
    this._dispatchLogin(new firebase.auth.GoogleAuthProvider());
  }

  signInWithFacebook() {
    this._dispatchLogin(new firebase.auth.FacebookAuthProvider());
  }

  signInWithTwitter() {
    this._dispatchLogin(new firebase.auth.TwitterAuthProvider());
  }

  _dispatchLogin(provider: AuthProvider) {
    this._store.dispatch(new UserActions.LoginProvider(provider));
  }

}
