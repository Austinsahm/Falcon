import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { MatInputModule } from '@angular/material/input';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { DeviceCategoryFieldComponent } from 'src/app/widgets/device-widget/device-category-field/device-category-field.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DashboardHttpService } from 'src/app/data-access/http/dashboard-http.service';
import { ToastrService } from 'ngx-toastr';
import { DeviceService } from '../../device-management/device.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Subscription, concatMap, map } from 'rxjs';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import { DeviceCoordinates } from 'src/app/models/gps.model';
import { AlarmHttpService } from 'src/app/data-access/http/alarm-http.service';
import { AlarmReport } from 'src/app/models/device.model';
import * as XLSX from 'xlsx';
import * as fileSaver from 'file-saver';

@Component({
  selector: 'app-alarm-report',
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
  templateUrl: './alarm-report.component.html',
  styleUrls: ['./alarm-report.component.scss'],
})
export class AlarmReportComponent implements OnInit {
  today = new Date();
  dateForm: FormGroup;
  devices: DashboardDevice[] = [];
  subscription!: Subscription;
  companyId: string = '';
  dataSource = new MatTableDataSource<any>();
  loading: boolean = false;
  alarms: AlarmReport[] = [];
  export: boolean = false;

  displayedColumns: string[] = [];

  // @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @Output() selectedDeviceId = new EventEmitter<string[]>();
  @ViewChild('table') table: ElementRef | undefined;

  constructor(
    private readonly fb: FormBuilder,
    private userInfo: UserInfoService,
    private deviceService: DeviceService,
    private toastr: ToastrService,
    private readonly dashboard: DashboardHttpService,
    private alarm: AlarmHttpService
  ) {
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

  alarmReport(device: any) {
    this.loading = true;

    let startDate = this.dateForm
      .get('startDate')!
      .value.format('YYYY-MM-DD HH:mm:ss');
    let endDate = this.dateForm
      .get('endDate')!
      .value.format('YYYY-MM-DD HH:mm:ss');

    const deviceId = this.dateForm.value.deviceId;

    this.selectedDeviceId.emit(device.deviceId);

    // this.alarm.alarmReport(deviceId, startDate, endDate).subscribe((data) => {
    //   console.log(data);
    //   this.alarms = data;
    //   console.log(data, 'Data');

    //   this.displayedColumns = data.map((data) => {
    //     return data.attribute;
    //   });
    //   console.log(this.displayedColumns, "Display Coloumn");

    //   const c = data.map((data) => {
    //     return { [data.attribute]: data.count };
    //   });
    //   // this.displayedColumns = Object.keys(c)
    //   console.log(c, 'Colomns');

    //   // this.dataSource.data = [Object.assign({}, ...c)]
    //   this.dataSource.data = c;
    //   // this.dataSource.paginator = this.paginator;
    //   this.loading = false;
    //   this.export = true;
    // });

    this.alarm.alarmReport(deviceId, startDate, endDate).subscribe((data) => {
      console.log(data);
      this.alarms = data;
      console.log(data, 'Data');

      this.displayedColumns = ['attribute', 'count']; // Define the columns you want to display

      this.dataSource.data = data; // Assign the entire data array to the dataSource

      this.loading = false;
      this.export = true;
    });
  }

  onExport() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.alarms);

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, 'Alarm Summary');
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
