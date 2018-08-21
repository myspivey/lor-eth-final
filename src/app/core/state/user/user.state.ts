import { Web3Service } from '@lor/core/services';
import { loadingFalse } from '@lor/shared/utils/operators';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';

import { of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { ILorUser } from '../../models/lor-user.interface';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { UserActions } from './user.actions';

export interface IStateModel {
  loading: boolean;
  user?: ILorUser;
  ethAccounts?: string[];
  ethAccountPrimary?: string;
}

const defaults: IStateModel = {
  loading: true
};

@State<IStateModel>({
  name: 'user', defaults
})
export class UserState implements NgxsOnInit {

  // --- SELECTORS ---
  @Selector()
  static loading(state: IStateModel) { return state.loading; }

  @Selector()
  static currentUser(state: IStateModel) { return state.user; }

  @Selector()
  static ethAccountPrimary(state: IStateModel) { return state.ethAccountPrimary; }

  @Selector()
  static ethAccounts(state: IStateModel) { return state.ethAccounts; }

  @Selector()
  static currentUserInAccounts(state: IStateModel) {
    const { user, ethAccounts } = state;
    if (!user || !ethAccounts) { return false; }
    return ethAccounts.includes(user.address);
  }

  @Selector()
  static loggedIn(state: IStateModel) { return state.user !== null; }

  // --- SETUP ---
  constructor(
    private _logger: LoggerService,
    private _authService: AuthService,
    private _web3service: Web3Service,
  ) { }

  ngxsOnInit({ getState, patchState }: StateContext<IStateModel>) {
    this._logger.setNamespace(this.constructor.name);
    this._authService.currentUser$.subscribe(user => patchState({ loading: false, user }));
    this._web3service.getAccounts().subscribe(ethAccounts => patchState({ ethAccounts, ethAccountPrimary: ethAccounts[0] }));

    // Per MetaMask. I hate this.
    // https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
    setInterval(() => { this._getAccounts(patchState); }, 1000);
  }

  private _getAccounts(patchState) {
    this._web3service.getAccounts().subscribe(ethAccounts => patchState({ ethAccounts, ethAccountPrimary: ethAccounts[0] }));
  }

  // --- ACTIONS ---
  @Action(UserActions.LoginUport)
  loginUport({ patchState }: StateContext<IStateModel>, action: UserActions.LoginUport) {
    patchState({ loading: true });

    return this._authService
      .uportLogin()
      .pipe(loadingFalse(patchState));
  }

  @Action(UserActions.SignupEmail)
  signupEmail({ patchState }: StateContext<IStateModel>, { email, pass }: UserActions.SignupEmail) {
    patchState({ loading: true });

    return this._authService
      .emailSignUp(email, pass)
      .pipe(loadingFalse(patchState));
  }

  @Action(UserActions.LoginEmail)
  loginEmail({ patchState }: StateContext<IStateModel>, { email, pass }: UserActions.LoginEmail) {
    patchState({ loading: true });

    return this._authService
      .emailLogin(email, pass)
      .pipe(loadingFalse(patchState));
  }

  // --- ACTIONS ---
  @Action(UserActions.LoginProvider)
  loginProvider({ patchState }: StateContext<IStateModel>, action: UserActions.LoginProvider) {
    patchState({ loading: true });

    return this._authService
      .loginProvider(action.payload)
      .pipe(loadingFalse(patchState));
  }

  @Action(UserActions.Logout)
  logout({ patchState, setState }: StateContext<IStateModel>) {
    patchState({ loading: true });

    return this._authService
      .logout()
      .pipe(
        tap(() => setState(defaults)),
        catchError(error => throwError(error)),
      );
  }

  @Action(UserActions.SaveProfile)
  saveProfile({ patchState, setState }: StateContext<IStateModel>, action: UserActions.SaveProfile) {
    patchState({ loading: true });

    return this._authService
      .saveProfile(action.payload)
      .pipe(
        switchMap((result) => (action.oracle) ? this._authService.callOracle(action.oracle) : of(true)),
        loadingFalse(patchState)
      );
  }
}
