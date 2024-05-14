import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
  OnDestroy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHttpService } from 'src/app/data-access/http/dashboard-http.service';
import { DeviceService } from '../../device-management/device.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LiveLocationService } from 'src/app/data-access/http/live-location.service';

@Component({
  selector: 'app-monitor-device-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatListModule,
  ],
  templateUrl: './monitor-device-list.component.html',
  styleUrls: ['./monitor-device-list.component.scss'],
})
export class MonitorDeviceListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Output() selectedDeviceId = new EventEmitter<string[]>();
  // @Output() selectedDeviceId = new EventEmitter<string>();
  @Input() set devicesArray(devices: DashboardDevice[]) {
    console.log(devices);

    this.devices = devices ?? [];
    this.devices.map((device) => {
      this.checkStatus(device);
    });
  }
  user: any;

  selection = new SelectionModel<DashboardDevice>(true, []);

  subscription!: Subscription;

  displayedColumns: string[] = ['select', 'column1', 'column2', 'column3'];

  deviceIds: string[] = [];
  selectRow = 0;

  dashboards$: any = [];
  companyId = '';
  devices: DashboardDevice[] = [];
  dataSource = new MatTableDataSource<DashboardDevice>();

  constructor(
    private http: HttpClient,
    private deviceService: DeviceService,
    private readonly dashboardHttpService: DashboardHttpService,
    private userInfo: UserInfoService,
    private webSocket: LiveLocationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // this.user = this.userInfo.getUserInfo();
    this.subscription = this.userInfo.getUser().subscribe((user) => {
      if (user) this.companyId = user.userCompanyId;
    });
    // this.companyId = this.user.userCompanyId;
    // this.out();

    // this.webSocket
    //   .receiveCommand('DEjR8Ktps7y9j9XEG')
    //   .subscribe((v) => console.log(v, 'open subsc'));
  }

  ngAfterViewInit() {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleChecked(row: DashboardDevice) {
    if (this.selectedRow()) {
      // const deviceIds =
      this.dataSource.data
        .filter((el) => el.deviceId === row.deviceId)
        .forEach((el) => this.deviceIds.push(el.deviceId));

      this.selectedDeviceId.emit(this.deviceIds);
    } else {
      const uncheckDevice = this.deviceIds.findIndex(
        (el) => el === row.deviceId
      );

      this.deviceIds.splice(uncheckDevice, 1);

      this.selectedDeviceId.emit(this.deviceIds);
      // this.selection.clear();
      return;
    }
  }

  selectedRow(): boolean {
    const numSelected = this.selection.selected.length;
    console.log(numSelected, this.selectRow, this.deviceIds);

    if (numSelected > this.selectRow) {
      this.selectRow = this.selectRow + 1;
      return true;
    }
    this.selectRow = this.selectRow - 1;
    return false;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectedDeviceId.emit([]);
      return;
    }
    this.selectRow = this.selection.select.length;
    this.dataSource.data
      .map((el) => el.deviceId)
      .forEach((el) => {
        this.deviceIds.push(el);
        this.selectRow = this.selectRow + 1;
      });
    this.selection.select(...this.dataSource.data);

    this.selectedDeviceId.emit(this.deviceIds);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DashboardDevice): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    // const deviceIds = []
    // deviceIds.push(row.deviceId)
    // console.log(deviceIds);

    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.deviceId + 1
    }`;
  }

  out() {
    this.deviceService.getData(this.companyId).subscribe((res) => {
      this.devices = res;
      this.dataSource.data = res;
      this.dataSource.paginator = this.paginator;
      // this.dataSource.filter = filtervalue.trim().toLowerCase();
      // this.dataSource.sort = this.sort;
      res.map((device) => {
        // this.checkStatus(device);
      });
    });
  }

  checkStatus(device: DashboardDevice) {
    let command = {
      action: 'heart-beat',
      manufDeviceId: device?.manufDeviceId,
      deviceId: device?.deviceId,
    };
    const d = { device: device?.deviceId, status: false };
    this.webSocket.sendCommand(command).subscribe((res) => {
      console.log(command, res.status, 'qwertyu');
      if (res.status === 'online') {
        console.log(res.status, 'qwertyu');
        if (res.response.manufDeviceId === command.manufDeviceId) {
          console.log('yes');
          device.deviceStatus = 'online';
        }
      } else if (res.status === 'offline') {
        device.deviceStatus = 'offline';
      }
    });

    // this.webSocket.webSocketStatus(device.deviceId).subscribe((client) => {
    //   console.log(client);

    //   if (client) {

    //   }
    // });
  }

  applyFilter(filtervalue: string) {
    this.dataSource.filter = filtervalue.trim().toLowerCase();
  }

  getOnlineDeviceCount(): number {
    return this.devices.filter((device) => device.deviceStatus === 'online')
      .length;
  }

  getOfflineDeviceCount(): number {
    return this.devices.filter((device) => device.deviceStatus === 'offline')
      .length;
  }
}
