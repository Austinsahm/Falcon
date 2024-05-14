import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { ProgressOutput } from './type';
import { attachProgress } from './functions';

@Pipe({
  name: 'progress',
  standalone: true
})
export class ProgressPipe implements PipeTransform {

  transform<T>(obj: Observable<T> | Promise<T> | T): Observable<ProgressOutput<T | any>>;
    transform<T>(obj: Observable<T> | Promise<T> | T) {
       return attachProgress(obj);
    }

}
