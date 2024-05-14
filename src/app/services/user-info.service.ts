import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { UserSessionInformation, userSchema } from '../models/user.interface';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable({
  providedIn: 'root',
})
export class UserInfoService {
  private _isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private _user = new BehaviorSubject<UserSessionInformation>(
    <UserSessionInformation>{}
  );

  public readonly $isLoggedIn: Observable<boolean> =
    this._isLoggedIn.asObservable();

  constructor(private storage: StorageMap) {
    this.getUser().subscribe();
    // const userInfo = localStorage.getItem('user_info');

    // if (userInfo) {
    //   this._isLoggedIn.next(true);
    // }
  }

  getUserInfo(): UserSessionInformation {
    const userInfo = localStorage.getItem('user_info');

    //return {companyId: 'abcltd'};
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (e) {
        return null as any;
      }
    }

    return null as any;
  }

  getUser() {
    if (this._user.value.companyName) {
      return this._user
        .asObservable()
        .pipe(tap(() => this._isLoggedIn.next(true)));
    }
    return this.storage.get<UserSessionInformation>('falcon', userSchema).pipe(
      map((user) => {
        if (user) {
          this._isLoggedIn.next(true);
          this._user.next(user);
          return user;
        } else return null;
      })
    );
  }

  setUser(user: UserSessionInformation) {
    delete user?.numActiveDevice;
    delete user.numCorporate;
    delete user.numInactiveDevice;
    delete user.numIndividual;
    delete user.numPartner;
    console.log(user);

    return this.storage.set('falcon', user, userSchema).pipe(
      tap((u) => {
        // console.log(user,u);

        this._isLoggedIn.next(true);
        this._user.next(user);
      })
    );
  }

  setUserInfo(userInfo: UserSessionInformation) {
    if (!userInfo) {
      return;
    }

    localStorage.setItem('user_info', JSON.stringify(userInfo || {}));

    this._isLoggedIn.next(true);
  }

  deleteUser() {
    return this.storage.clear().pipe(
      tap(() => {
        this._isLoggedIn.next(false);
        this._user.next(<UserSessionInformation>{});
      })
    );
  }

  deleteUserInfo() {
    localStorage.removeItem('user_info');
    this._isLoggedIn.next(false);
  }

  isAuthenticated() {
    return this._isLoggedIn.value;
  }
}
