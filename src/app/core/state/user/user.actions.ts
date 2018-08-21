import { AuthProvider } from '@firebase/auth-types';

import { ILorUser } from '../../models/lor-user.interface';

export namespace UserActions {
  export enum ActionTypes {
    LOGIN_UPORT = '[User] Login uPort',
    SIGNUP_EMAIL = '[User] Signup Email',
    LOGIN_EMAIL = '[User] Login Email',
    LOGIN_PROVIDER = '[User] Login Provider',
    LOGOUT = '[User] Logout',
    SAVE_PROFILE = '[User] Safe Profile'
  }

  export class LoginUport {
    static readonly type = ActionTypes.LOGIN_UPORT;
    constructor() { }
  }

  export class SignupEmail {
    static readonly type = ActionTypes.SIGNUP_EMAIL;
    constructor(public email: string, public pass: string) { }
  }

  export class LoginEmail {
    static readonly type = ActionTypes.LOGIN_EMAIL;
    constructor(public email: string, public pass: string) { }
  }

  export class LoginProvider {
    static readonly type = ActionTypes.LOGIN_PROVIDER;
    constructor(public payload: AuthProvider) { }
  }

  export class Logout {
    static readonly type = ActionTypes.LOGOUT;
    constructor() { }
  }

  export class SaveProfile {
    static readonly type = ActionTypes.SAVE_PROFILE;
    constructor(public payload: Partial<ILorUser>, public oracle?: string) { }
  }
}

