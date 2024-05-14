import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../map/map.component';
import { DeviceListComponent } from '../../device-management/device-list/device-list.component';
import { MonitorDeviceListComponent } from '../monitor-device-list/monitor-device-list.component';
import { LiveLocationService } from 'src/app/data-access/http/live-location.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { DeviceService } from '../../device-management/device.service';
import { Subscription, concatMap, map, of, switchMap } from 'rxjs';
import { DashboardDevice } from 'src/app/models/dashboard.model';

@Component({
  selector: 'app-monitor-home',
  standalone: true,
  imports: [CommonModule, MapComponent, MonitorDeviceListComponent],
  templateUrl: './monitor-home.component.html',
  styleUrls: ['./monitor-home.component.scss'],
})
export class MonitorHomeComponent implements OnInit {
  selectedDeviceId!: string[];

  subscription!: Subscription;
  devices!: DashboardDevice[];
  companyId!: string;
  subdomain!: string;

  constructor(
    private deviceService: DeviceService,
    private userInfo: UserInfoService
  ) {}

  ngOnInit(): void {
    this.subscription = this.userInfo
      .getUser()
      .pipe(
        concatMap((user) => {
          if (user) {
            this.companyId = user.userCompanyId;
            this.subdomain = user.userCompanyId
            return this.deviceService
              .getData(user.userCompanyId)
              .pipe(map((devices) => (this.devices = devices)));
          } else return of();
        })
      )
      .subscribe();
  }

  getDevice(deviceIds: string[]) {
    this.selectedDeviceId = [...deviceIds];
  }
}
