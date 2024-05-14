import { Injectable } from '@angular/core';
import { LoginDetails, UserInfo } from '../models/login-details.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { concatMap, map, Observable, of } from 'rxjs';
import { UserInfoService } from './user-info.service';
import { HttpResp } from '../models/http.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private userInfoService: UserInfoService
  ) {}

  login(data: LoginDetails): Observable<boolean> {
    return this.http
      .post<HttpResp<UserInfo>>(
        `${environment.apiServerEndpoint}/user/login`,
        data
      )
      .pipe(
        concatMap((user) => {
          console.log(user);

          if (!user) return of(false);
          return this.userInfoService
            .setUser(user.response)
            .pipe(map(() => true));
        })
      );
  }
}
