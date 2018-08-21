import { Observable, OperatorFunction, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export function loadingFalse<T>(patchState: (val: Partial<T>) => any): OperatorFunction<T, T> {
  return function (source$: Observable<T>): Observable<T> {
    return source$.pipe(
      tap(() => patchState(<any>{ loading: false })),
      catchError(error => {
        patchState(<any>{ loading: false });
        return throwError(error);
      }),
    );
  };
}
