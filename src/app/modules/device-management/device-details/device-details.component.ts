import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DeviceService } from '../device.service';
import { HttpClient } from '@angular/common/http';
import {
  DeviceCategoryDirectory,
  DeviceDetail,
} from 'src/app/models/device.model';
import { DeviceFormData } from 'src/app/models/device.model';
import { concatMap, filter, Observable, tap, map, Subscription } from 'rxjs';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { StatusCode } from 'src/app/models/http.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserInfoService } from 'src/app/services/user-info.service';
import { DeviceCategoryHttpService } from 'src/app/data-access/http/device-category-http.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-device-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.scss'],
})
export class DeviceDetailsComponent implements OnInit, OnDestroy {
  // user: any;
  editMode = false;

  deviceId!: string | null;
  devices$!: Observable<DashboardDevice[]>;
  companyId = '';

  addDeviceForm: FormGroup;
  subscription!: Subscription;
  category: DeviceCategoryDirectory[] = [];
  loading: boolean = true;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private userInfo: UserInfoService,
    private deviceCategory: DeviceCategoryHttpService
  ) {
    this.addDeviceForm = this.formBuilder.group({
      deviceId: '',
      manufDeviceId: ['', [Validators.required]],
      deviceName: ['', [Validators.required]],
      deviceDesc: ['', [Validators.required]],
      clientDeviceCategId: ['', [Validators.required]],
      devicePac: ['', [Validators.required]],
      networkId: ['gps', [Validators.required]],
      certificate: ['', [Validators.required]],
      manufacturerId: ['general', [Validators.required]],
      manufDeviceTypeId: ['TKDEV', [Validators.required]],
      assetId: ['uncl', [Validators.required]],
      useCaseId: ['0', [Validators.required]],
      statusId: ['A', [Validators.required]],
      lastSeenDate: [new Date().toISOString()],
      networkRefresh: ['N'],
      assetTracker: ['Y'],
      minSpeed: ['', [Validators.required]],
      maxSpeed: ['', [Validators.required]],
      userId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.subscription = this.userInfo.getUser().subscribe((user) => {
      if (user) this.companyId = user.userCompanyId;
    });

    this.route.paramMap.subscribe(
      (param) => (this.deviceId = param.get('device-id'))
    );
    this.devices$ = this.deviceService.getData(this.companyId).pipe(
      map((devices) => {
        return devices.filter((device) => device.deviceId === this.deviceId);
      })
    );
    this.devices$.subscribe((data) => {
      this.updateForm(data[0]);
      this.loading = false;
      // console.log(data[0]);
    });

    this.deviceCategory.fetchDirectory(this.companyId).subscribe((data) => {
      // console.log(data);
      this.category = data;
    });
  }

  updateForm(data: DashboardDevice) {
    this.addDeviceForm.patchValue({
      deviceId: data.deviceId,
      manufDeviceId: data.manufDeviceId,
      deviceName: data.deviceName,
      certificate: data.certificate,
      companyId: data.companyId,
      companyName: data.companyName,
      devicePac: data.devicePac,
      manufDeviceTypeId: data.manufDeviceTypeId,
      deviceDesc: data.deviceDesc,
      clientDeviceCategId: data.clientDeviceCategId,
      maxSpeed: data.maxSpeed,
      minSpeed: data.minSpeed,
    });
  }

  back() {
    this.editMode = false;
  }

  edit() {
    this.editMode = !this.editMode;
  }

  close() {
    this.router.navigate([`./device-management/device-list`]);
  }

  onSubmit() {
    let deviceFormData: DeviceFormData = this.addDeviceForm.value;

    // userCompanyId

    this.deviceService.createDevice(deviceFormData).subscribe(
      (res) => {
        if (res.statusCode === StatusCode.OK) {
          this.toastr.success('Device edited successfully', 'Edit Device');
          this.router.navigate([`./device-management/device-list`]);
        } else {
          this.toastr.error('Error while editing', 'Edit Device');
        }
      },
      (error) => {
        if (!error.status)
          this.toastr.error("You can't Edit, You are offline", 'Edit Device');
        else this.toastr.error('Unknown errors', 'Edit Device');
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
