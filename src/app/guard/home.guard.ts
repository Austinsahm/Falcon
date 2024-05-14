import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable, map } from 'rxjs';
import { UserInfoService } from '../services/user-info.service';

@Injectable({
  providedIn: 'root',
})
export class HomeGuard implements CanActivate, CanLoad {
  constructor(private router: Router, private userSession: UserInfoService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.userSession.getUser().pipe(
      map((islogin) => {
        if (!islogin) this.router.navigate(['login']);
        return true;
      })
    );
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    console.log(this.userSession.isAuthenticated());
    if (!this.userSession.isAuthenticated()) {
      this.router.navigate(['login']);
    }
    return true;
  }
}
