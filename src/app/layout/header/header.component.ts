import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UserInfoService } from 'src/app/services/user-info.service';
import {
  Observable,
  Subscription,
  concatMap,
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';
import { UserInfo } from 'src/app/models/login-details.model';
import { UserSessionInformation } from 'src/app/models/user.interface';
import { Router } from '@angular/router';
import { NotificationComponent } from '../notification/notification.component';
import { DeviceService } from 'src/app/modules/device-management/device.service';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import { LiveLocationService } from 'src/app/data-access/http/live-location.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, NotificationComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user$!: Observable<UserSessionInformation | null>;
  notify = false;
  subscription!: Subscription;
  companyId!: string;
  subdomain!: string;
  devices!: DashboardDevice[];
  notifications: any = [];
  audio
  // user: any;

  constructor(
    private userInfo: UserInfoService,
    private router: Router,
    private deviceService: DeviceService,
    private websocket: LiveLocationService
  ) {
    this.audio = new Audio('assets/mixkit-digital-clock-digital-alarm-buzzer-992.wav');
  }

  ngOnInit(): void {
    // this.user = this.userInfo.getUserInfo();
    this.user$ = this.userInfo.getUser();
    // console.log(this.user);

    this.subscription = this.userInfo
      .getUser()
      .pipe(
        switchMap((user) => {
          if (user) {
            this.companyId = user.userCompanyId;
            this.subdomain = user.userCompanyId;

            return this.deviceService.getData(user.userCompanyId).pipe(
              switchMap((devices) => {
                // Use forkJoin to wait for all inner observables to complete
                const observables = devices.map((dev) => {
                  console.log(dev);

                  return this.websocket.alarmStatus(dev.deviceId).pipe(
                    map((data) => {
                      // Testing
                      console.log(data);
                      if (data.status === 'geofence-alarm') {
                        console.log(data);
                        this.notifications.push(data);
                        return data; // You might want to return data if needed
                      }
                    })
                  );
                });

                return forkJoin(observables);
              })
            );
          } else {
            return of();
          }
        })
      )
      .subscribe((res) => {
        console.log(res);

        // Now res is an array containing the results of all inner observables
        // You can iterate over it if needed
        // res.map((data) => console.log(data, 'alarm'));
      });
  }

  logOut() {
    this.userInfo
      .deleteUser()
      .subscribe(() => this.router.navigate(['/login']));
    // console.log('Logout');
  }


  playAlarm() {
    this.notify = !this.notify;

    if (this.notify) {
      console.log('Play Audio');
      this.audio.play();
    } else {
      console.log('Pause Audio');
      this.audio.pause();
      this.audio.currentTime = 0; // Reset audio to the beginning
    }
  }
}
