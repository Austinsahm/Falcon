import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectFieldComponent } from '../../common_widget/combo-select-field/combo-select-field.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { ComboBoxOption } from '../../common_widget/type';
import { DeviceHttpService } from 'src/app/data-access/http/device-http.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeviceCategoryDirectory } from 'src/app/models/device.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-device-category-field',
  standalone: true,
  imports: [
    CommonModule,
    ComboSelectFieldComponent,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './device-category-field.component.html',
  styleUrls: ['./device-category-field.component.scss'],
})
export class DeviceCategoryFieldComponent implements OnInit, OnDestroy {
  private deviceCategoryDirectory = new BehaviorSubject<
    DeviceCategoryDirectory[]
  >([]);
  companyId = '';
  user: any;
  options$!: Observable<ComboBoxOption<string>[]>;
  options!: ComboBoxOption<string>[];
  deviceCategoryDirectory$!: Observable<DeviceCategoryDirectory[]>;
  subscription!: Subscription;

  constructor(
    private devService: DeviceHttpService,
    private userInfo: UserInfoService
  ) {}

  ngOnInit(): void {
    this.subscription = this.userInfo.getUser().subscribe((user) => {
      if (user) this.companyId = this.user.userCompanyId;
    });

    //   this.deviceCategoryDirectory$ = this.devService.fetchDirectory(this.companyId)
    //   this.options$ = this.deviceCategoryDirectory$.
    //   pipe(
    //     map((categories) => {
    //       categories.map(
    //       (category) => {
    //       return {
    //         key: category.deviceCategId,
    //         value: category.deviceCategId,
    //         label: `${category.deviceCategName} - ${category.companyName}`
    //       }
    //     })})
    //   )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
