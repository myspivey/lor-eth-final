import { APP_INITIALIZER } from '@angular/core';
import { UserState } from '@lor/core/state';
import { Store } from '@ngxs/store';

import { first } from 'rxjs/operators';

export function initializer(
  _store: Store,
) {
  return () => {
    return _store.select(UserState.loading).pipe(
      first(loading => !loading),
    ).toPromise();
  };
}

export const AppInitializer = {
  provide: APP_INITIALIZER,
  useFactory: initializer,
  deps: [Store],
  multi: true,
};
