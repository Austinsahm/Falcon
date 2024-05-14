import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DeviceService } from '../device.service';
import {
  DeviceCategoryDirectory,
  DeviceFormData,
} from 'src/app/models/device.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { StatusCode } from 'src/app/models/http.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Subscription } from 'rxjs';
import { DeviceCategoryHttpService } from 'src/app/data-access/http/device-category-http.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.scss'],
})
export class AddDeviceComponent implements OnInit, OnDestroy {
  user: any;
  addDeviceForm: FormGroup;
  subscription!: Subscription;
  category: DeviceCategoryDirectory[] = [];
  companyId: string = '';
  // adminPhoneNumbers: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private deviceService: DeviceService,
    private router: Router,
    private toastr: ToastrService,
    private readonly route: ActivatedRoute,
    private userInfo: UserInfoService,
    private deviceCategory: DeviceCategoryHttpService
  ) {
    this.addDeviceForm = this.formBuilder.group({
      deviceId: 'new-record-01',
      manufDeviceId: ['', [Validators.required]],
      deviceName: ['', [Validators.required]],
      deviceDesc: ['', [Validators.required]],
      devicePac: ['', [Validators.required]],
      clientDeviceCategId: ['', [Validators.required]],
      networkId: ['gps', [Validators.required]],
      manufacturerId: ['general', [Validators.required]],
      manufDeviceTypeId: ['TKDEV', [Validators.required]],
      assetId: ['uncl', [Validators.required]],
      statusId: ['A', [Validators.required]],
      lastSeenDate: [new Date().toISOString()],
      assetTracker: ['Y'],
      networkRefresh: ['N'],
      userId: ['', [Validators.required]],
      useCaseId: ['0', [Validators.required]],
      certificate: ['', [Validators.required]],
      minSpeed: ['', [Validators.required]],
      maxSpeed: ['', [Validators.required]],
      phoneNumbers: this.formBuilder.array([]),
      emailAddresses: this.formBuilder.array([]),
    });

    // this.adminPhoneNumbers = this.formBuilder.group({
    //   phoneNumber1: ['', [Validators.required]],
    //   phoneNumber2: ['', [Validators.required]],
    //   phoneNumber3: ['', [Validators.required]],
    //   phoneNumber4: ['', [Validators.required]],
    //   phoneNumber5: ['', [Validators.required]],
    // });
  }

  ngOnInit(): void {
    this.subscription = this.userInfo.getUser().subscribe((user) => {
      if (user) {
        this.companyId = user.userCompanyId;
        this.addDeviceForm.patchValue({ userId: user.userId });
      }
    });

    this.deviceCategory.fetchDirectory(this.companyId).subscribe((data) => {
      // console.log(data);
      this.category = data;
    });

    this.addPhoneNumber();
    this.addEmailAddress();
  }

  get phoneNumbers(): FormArray {
    return this.addDeviceForm.get('phoneNumbers') as FormArray;
  }

  addPhoneNumber() {
    if (this.phoneNumbers.length < 5) {
      this.phoneNumbers.push(
        this.formBuilder.control('', [Validators.required])
      );
    }
  }

  removePhoneNumber(index: number) {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  get emailAddresses(): FormArray {
    return this.addDeviceForm.get('emailAddresses') as FormArray;
  }

  addEmailAddress() {
    if (this.emailAddresses.length < 5) {
      this.emailAddresses.push(
        this.formBuilder.control('', [Validators.required])
      );
    }
  }

  removeEmailAddress(index: number) {
    if (this.emailAddresses.length > 1) {
      this.emailAddresses.removeAt(index);
    }
  }

  check() {
    console.log(this.phoneNumbers.value);
  }

  onSubmit() {
    // const formData = this.addDeviceForm.value;
    // this.http.post('https://test.datanucleusinc.com/greensky390/device/save-device', formData).subscribe();

    let deviceFormData: DeviceFormData = this.addDeviceForm.value;

    console.log(deviceFormData);

    this.deviceService.createDevice(deviceFormData).subscribe(
      (res) => {
        if (res.statusCode === StatusCode.OK) {
          this.toastr.success('Device Created successfully', 'Create Device');
          this.router.navigate([`./device-management/device-list`]);
        } else {
          this.toastr.error('Error while creating', 'Create Device');
        }
      },
      (error) => {
        if (!error.status)
          this.toastr.error(
            "You can't create, You are offline",
            'Create Device'
          );
        else this.toastr.error('Unknown errors', 'Create Device');
      }
    );
  }

  close() {
    this.router.navigate([`./device-management/device-list`]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
