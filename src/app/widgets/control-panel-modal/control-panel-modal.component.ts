import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { LiveLocationService } from 'src/app/data-access/http/live-location.service';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-control-panel-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatRadioModule,
  ],
  templateUrl: './control-panel-modal.component.html',
  styleUrls: ['./control-panel-modal.component.scss'],
})
export class ControlPanelModalComponent implements OnInit, AfterViewInit {
  @ViewChild('modalDialog') modalDialog!: ElementRef;
  dev: any;

  @Input() set device(v: DashboardDevice) {
    console.log(v);
    this.dev = v;
    this.setAuthorityNumbers.patchValue({
      deviceId: this.dev?.deviceId,
      manufDeviceId: this.dev?.manufDeviceId,
    });
    this.uploadTimeForm.patchValue({
      deviceId: this.dev?.deviceId,
      manufDeviceId: this.dev?.manufDeviceId,
    });
  }

  hide = true;

  UploadTime: boolean = false;
  authorityNumber: boolean = false;
  alarmSetting: boolean = false;
  cutOffTab: boolean = false;
  speedLimitTab: boolean = false;

  setAuthorityNumbers: FormGroup;
  uploadTimeForm: FormGroup;
  cutOffForm: FormGroup;
  setSpeedLimitForm: FormGroup;

  sendMethodControl = new FormControl();

  constructor(
    private formBuilder: FormBuilder,
    private webSocket: LiveLocationService,
    private toastr: ToastrService
  ) {
    this.setAuthorityNumbers = this.formBuilder.group({
      action: 'admin-numbers',
      manufDeviceId: ['', [Validators.required]],
      deviceId: ['', [Validators.required]],
      number1: ['', [Validators.required]],
      number2: ['', [Validators.required]],
      number3: ['', [Validators.required]],
      number4: ['', [Validators.required]],
      number5: ['', [Validators.required]],
    });

    this.uploadTimeForm = this.formBuilder.group({
      action: 'gprs-interval',
      manufDeviceId: ['', [Validators.required]],
      deviceId: ['', [Validators.required]],
      interval: ['', [Validators.required]],
    });

    this.cutOffForm = this.formBuilder.group({
      action: 'power',
      stop: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.setSpeedLimitForm = this.formBuilder.group({
      action: 'speed-limit',
      speedLimit: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges() {}

  setAuthNumber() {
    const command = {
      action: this.setAuthorityNumbers.value.action,
      manufDeviceId: this.setAuthorityNumbers.value.manufDeviceId,
      deviceId: this.setAuthorityNumbers.value.deviceId,
      numbers: [
        this.setAuthorityNumbers.value.number1,
        this.setAuthorityNumbers.value.number2,
        this.setAuthorityNumbers.value.number3,
        this.setAuthorityNumbers.value.number4,
        this.setAuthorityNumbers.value.number5,
      ],
    };

    this.webSocket.sendCommandAuthority(command).subscribe((res) => {
      console.log(command);
      console.log(res);
      if (res?.status == 'acknowledged') {
        this.toastr.success('Received', 'Set Authority Number');
      } else if (res?.status == 'error') {
        this.toastr.error('Error', 'Set Authority Number');
      }
    });
  }

  setUploadTime() {
    const command = {
      action: this.uploadTimeForm.value.action,
      manufDeviceId: this.uploadTimeForm.value.manufDeviceId,
      deviceId: this.uploadTimeForm.value.deviceId,
      interval: this.uploadTimeForm.value.interval,
    };

    this.webSocket.setUploadTime(command).subscribe((res) => {
      console.log(command);
      console.log(res);
      if (res?.status == 'acknowledged') {
        this.toastr.success('Received', 'Set Upload Time');
      } else if (res?.status == 'error') {
        this.toastr.error('Error', 'Set Upload Time');
      }
    });
  }

  setCutOff() {
    const command = {
      action: this.cutOffForm.value.action,
      manufDeviceId: this.uploadTimeForm.value.manufDeviceId,
      deviceId: this.uploadTimeForm.value.deviceId,
      stop: this.cutOffForm.value.stop,
    };

    this.webSocket.cutOff(command).subscribe((res) => {
      console.log(command);
      console.log(res);
      if (res?.status == 'acknowledged') {
        this.toastr.success('Received', 'Cut Off Fuel and Power');
      } else if (res?.status == 'error') {
        this.toastr.error('Error', 'Cut Off Fuel and Power');
      }
    });
  }

  setSpeedLimit() {
    const command = {
      action: this.setSpeedLimitForm.value.action,
      manufDeviceId: this.uploadTimeForm.value.manufDeviceId,
      deviceId: this.uploadTimeForm.value.deviceId,
      speedLimit: this.setSpeedLimitForm.value.speedLimit,
    };

    this.webSocket.speedLimit(command).subscribe((res) => {
      console.log(command);
      console.log(res);
      if (res?.status == 'acknowledged') {
        this.toastr.success('Received', 'Speed Limit');
      } else if (res?.status == 'error') {
        this.toastr.error('Error', 'Speed Limit');
      }
    });
  }

  openUploadTime() {
    this.UploadTime = true;
    this.authorityNumber = false;
    this.alarmSetting = false;
    this.cutOffTab = false;
    this.speedLimitTab = false;
  }
  authorityNumbers() {
    this.UploadTime = false;
    this.authorityNumber = true;
    this.alarmSetting = false;
    this.cutOffTab = false;
    this.speedLimitTab = false;
  }
  alarmSettings() {
    this.UploadTime = false;
    this.authorityNumber = false;
    this.alarmSetting = true;
    this.cutOffTab = false;
    this.speedLimitTab = false;
  }

  cutOff() {
    this.UploadTime = false;
    this.authorityNumber = false;
    this.alarmSetting = false;
    this.cutOffTab = true;
    this.speedLimitTab = false;
  }

  speedLimit() {
    this.UploadTime = false;
    this.authorityNumber = false;
    this.alarmSetting = false;
    this.cutOffTab = false;
    this.speedLimitTab = true;
  }

  showModal() {
    this.modalDialog.nativeElement.showModal();
  }
}
