import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { DeviceCategoryFieldComponent } from 'src/app/widgets/device-widget/device-category-field/device-category-field.component';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { MatInputModule } from '@angular/material/input';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import { UserInfoService } from 'src/app/services/user-info.service';
import {
  Observable,
  Subscription,
  concatMap,
  forkJoin,
  from,
  map,
  of,
  retry,
  switchMap,
} from 'rxjs';
import { DeviceService } from '../../device-management/device.service';
import { ToastrService } from 'ngx-toastr';
import { DashboardHttpService } from 'src/app/data-access/http/dashboard-http.service';
import { DeviceCoordinates, Points } from 'src/app/models/gps.model';
import { GoogleMap } from 'src/app/widgets/sdk/google-map';
import * as XLSX from 'xlsx';
import * as fileSaver from 'file-saver';

@Component({
  selector: 'app-device-report-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatNativeDateModule,
    DeviceCategoryFieldComponent,
    NgxMatMomentModule,
    MatInputModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './device-report-list.component.html',
  styleUrls: ['./device-report-list.component.scss'],
})
export class DeviceReportListComponent implements OnInit {
  dateForm: FormGroup;
  today = new Date();
  devices: DashboardDevice[] = [];
  subscription!: Subscription;
  companyId: string = '';
  dataSource = new MatTableDataSource<DeviceCoordinates>();
  loading: boolean = false;
  path: DeviceCoordinates[] = [];
  GoogleMap!: any;
  showAddresses: boolean = false;
  showAddress: boolean = false;
  address: string | undefined;
  currentPath: DeviceCoordinates | undefined;
  export: boolean = false;
  addressIndex!: number;
  // selectedRows: boolean[] = [];

  displayedColumns: string[] = [
    'column1',
    'column2',
    'column3',
    'column4',
    'column5',
    'column6',
  ];

  fenceType: string[] = ['IN', 'OUT', 'BOTH'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @Output() selectedDeviceId = new EventEmitter<string[]>();
  @ViewChild('table') table: ElementRef | undefined;

  constructor(
    private readonly fb: FormBuilder,
    private userInfo: UserInfoService,
    private deviceService: DeviceService,
    private toastr: ToastrService,
    private readonly dashboard: DashboardHttpService,
    private gMapLoader: GoogleMap
  ) {
    this.gMapLoader.initMap().then((googleMaps) => {
      this.GoogleMap = googleMaps;
    });
    this.today = new Date();

    this.dateForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      deviceId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.subscription = this.userInfo
      .getUser()
      .pipe(
        concatMap((user) => {
          if (user) this.companyId = user.userCompanyId;
          return this.deviceService.getData(user?.userCompanyId).pipe(
            map((devices) => {
              if (devices.length) {
                this.devices = devices;
              } else {
                this.toastr.error('Devices Unavaliable', '');
              }
            })
          );
        })
      )
      .subscribe();
  }

  checkAddress() {
    this.showAddresses = !this.showAddresses;
  }

  fetchPath(devices: any) {
    this.loading = true;

    let startDate = this.dateForm
      .get('startDate')!
      .value.format('YYYY-MM-DD HH:mm:ss');
    let endDate = this.dateForm
      .get('endDate')!
      .value.format('YYYY-MM-DD HH:mm:ss');

    const deviceId = this.dateForm.value.deviceId;

    devices.deviceId;
    this.selectedDeviceId.emit(devices.deviceId);

    this.dashboard
      .geofenceTracing(deviceId, startDate, endDate)
      .pipe(
        switchMap((data) => {
          if (this.showAddresses === true) {
            return forkJoin(this.fetchAddress(data));
          } else {
            return of(data);
          }
        })
      )
      .subscribe((data) => {
        console.log(data);

        this.path = data;
        this.dataSource.data = this.path;
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        this.export = true;
      });
  }

  fetchGoogleStreet(
    lat: number,
    lng: number,
    path: DeviceCoordinates,
    index: number
  ) {
    this.showAddress = true;
    const location = { lat: lat, lng: lng };

    const geocoder = new this.GoogleMap.Geocoder();

    geocoder
      .geocode({ location })
      .then((response: any) => {
        if (response.results[0]) {
          // path.address = response.results[0].formatted_address;
          this.addressIndex = index;
          this.path[index].address = response.results[0].formatted_address;

          //  this.selectedRows[index] = true;
        } else {
          window.alert('Location address not found');
        }
      })
      .catch((e: any) => {});
  }

  fetchAddress(data: DeviceCoordinates[]) {
    return data.map((el) => {
      const location = { lat: el.lat, lng: el.lng };
      const geocoder = new this.GoogleMap.Geocoder();
      return from(geocoder.geocode({ location })).pipe(
        map((res: any) => ({
          ...el,
          address: res.results[0].formatted_address as string,
        })),
        retry(3)
      );
    });
  }

  onExport() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.path);

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, 'Device Summary');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    fileSaver.saveAs(data, fileName + new Date().getTime() + EXCEL_EXTENSION);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
