import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { DeviceService } from '../device.service';
import { DashboardHttpService } from 'src/app/data-access/http/dashboard-http.service';
import {
  concatMap,
  filter,
  finalize,
  map,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import {
  DashboardDevice,
  DashboardDirectory,
} from 'src/app/models/dashboard.model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AddDeviceComponent } from '../add-device/add-device.component';
import { MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    AddDeviceComponent,
    MatIconModule,
  ],
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
})
export class DeviceListComponent implements OnInit, OnDestroy {
  user: any;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['column1', 'column2', 'column3', 'column4'];

  dashboards$: any = [];
  companyId = '';
  devices: DashboardDevice[] = [];
  dataSource = new MatTableDataSource<any>();
  subscription!: Subscription;

  editMode = false;
  loading: boolean = true;

  // filtervalue!: string;

  constructor(
    private http: HttpClient,
    private deviceService: DeviceService,
    private readonly dashboardHttpService: DashboardHttpService,
    private router: Router,
    private route: ActivatedRoute,
    private userInfo: UserInfoService
  ) {}

  ngOnInit(): void {
    // this.user = this.userInfo.getUserInfo();
    // this.companyId = this.user.userCompanyId;
    // this.subscription = this.userInfo.getUser().subscribe((user) => {
    //   if (user) {
    //     this.out(user.userCompanyId);
    //     this.companyId = this.user.userCompanyId;
    //   }
    // });

    this.subscription = this.userInfo
      .getUser()
      .pipe(
        concatMap((user) => {
          return this.deviceService.getData(user?.userCompanyId).pipe(
            map((devices) => {
              this.devices = devices;
              this.dataSource.data = devices;
              this.dataSource.paginator = this.paginator;
            })
          );
        })
      )
      .subscribe(() => {
        this.loading = false;
        // Set this.loading to false when the subscription is complete (including errors)
      });

    // this.loading = false;
  }

  ngAfterViewInit() {
    // this.out();
  }

  out(companyId: string) {
    this.deviceService.getData(companyId).subscribe((res: any) => {
      this.devices = res;
      this.dataSource.data = res;
      this.dataSource.paginator = this.paginator;
      // this.dataSource.filter = filtervalue.trim().toLowerCase();
      // this.dataSource.sort = this.sort;
      console.log(res);
    });
  }

  applyFilter(filtervalue: string) {
    this.dataSource.filter = filtervalue.trim().toLowerCase();
  }

  disable() {
    console.log('disable');
  }

  view(deviceId: string) {
    this.router.navigate([`../device-details/${deviceId}`], {
      relativeTo: this.route,
    });
  }

  deleteDevice() {
    console.log('delete');
  }

  // addDevice(){
  //   this.router.navigate(['./device-management/addDevice']);
  // }

  addDevice() {
    this.router.navigate([`../add-device`], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
