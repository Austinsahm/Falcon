import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { MatInputModule } from '@angular/material/input';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { UserInfoService } from 'src/app/services/user-info.service';
import { DeviceService } from '../../device-management/device.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, concatMap, map } from 'rxjs';
import { DashboardDevice } from 'src/app/models/dashboard.model';

export interface alarm {
  alarmType: string;
  alarmTime: Date;
  lng: number;
  lat: number;
  speed: number;
  course: string;
  description: string;
  location: string;
}

@Component({
  selector: 'app-alarms',
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
    NgxMatMomentModule,
    MatInputModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './alarms.component.html',
  styleUrls: ['./alarms.component.scss'],
})
export class AlarmsComponent implements OnInit {
  alarmsForm: FormGroup;
  subscription!: Subscription;
  companyId: string = '';
  devices: DashboardDevice[] = [];
  loading: boolean = false;

  alarmType: string[] = [
    'All',
    'SOS distress',
    'Power failure alarm',
    'Vibration alarm',
    'Motion Alarm',
    'Burglar Alarm',
    'Enter Fence alarm',
    'Speed alarm',
    'Remove alarm',
  ];

  displayedColumns: string[] = [
    'alarmType',
    'alarmTime',
    'lng',
    'lat',
    'speed',
    'course',
    'description',
    'location',
  ];
  dataToDisplay: any[] = [];
  dataSource = new MatTableDataSource<any>(this.dataToDisplay);

  constructor(
    private readonly fb: FormBuilder,
    private userInfo: UserInfoService,
    private deviceService: DeviceService,
    private toastr: ToastrService
  ) {
    this.alarmsForm = this.fb.group({
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

    this.generateRandomData();
  }

  searchAlarm(device: any) {}

  // Generate random data and update the data source
  generateRandomData(): void {
    this.dataToDisplay = Array.from({ length: 20 }, () =>
      this.generateRandomDataEntry()
    );
    this.dataSource.data = this.dataToDisplay;
  }

  // Generate a single random data entry
  generateRandomDataEntry(): any {
    const alarmTypeOptions = [
      'SOS distress',
      'Power failure alarm',
      'Vibration alarm',
      'Motion Alarm',
      'Burglar Alarm',
      'Enter Fence alarm',
      'Speed alarm',
      'Remove alarm',
    ];

    const getRandomElement = (array: any[]) =>
      array[Math.floor(Math.random() * array.length)];

    return {
      alarmType: getRandomElement(alarmTypeOptions),
      alarmTime: new Date(),
      lng: 3.8720122,
      lat: 7.4018553,
      speed: Math.floor(Math.random() * 100),
      course: getRandomElement(['North', 'South', 'East', 'West']),
      description: 'Random Description',
      location:
        'Trinity Plaza, Obokun bus stop, Eleyele-Sango road Ibadan, Eleyele, Ibadan 200284, Oyo, Nigeria',
    };
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
