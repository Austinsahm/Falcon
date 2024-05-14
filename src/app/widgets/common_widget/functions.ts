import { from, isObservable, Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProgressOutput } from './type';

/**
 * Attaches progress information to a given observable or promise
 * @param obj
 * @param value Default value
 */
export function attachProgress<T>(
  obj: Observable<T> | Promise<T> | T,
  value?: T
): Observable<ProgressOutput<T>> {
  if (isObservable(obj) || obj instanceof Promise) {
    return (isObservable(obj) ? obj : from(obj)).pipe(
      map((v) => ({ value: v })),
      startWith({ loading: true, value }),
      catchError((error) => of({ error, value }))
    );
  }
  return of({ value: obj, loading: false, error: null });
}
