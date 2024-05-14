import {
  Component,
  OnInit,
  EventEmitter,
  forwardRef,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { ComboBoxOption } from '../type';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-combo-select-field',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './combo-select-field.component.html',
  styleUrls: ['./combo-select-field.component.scss'],
})
export class ComboSelectFieldComponent<T> implements OnInit {
  @Output() onBlur: EventEmitter<void>;

  @Input() loading!: boolean;
  @Input() loadingMessage!: string;
  @Input() options: Array<ComboBoxOption<T>> = [];
  @Input() placeholder!: string;
  @Input() emptyMessage!: string;
  @Input() defaultSelection!: string;
  //  @Input() control: FormControl;
  @Output() selectionChange = new EventEmitter<MatSelectChange>();

  private onChange = (value: T) => {};
  private onTouched = () => {};
  private unsubscriber = new Subject();

  control = new FormControl('');

  constructor() {
    this.onBlur = new EventEmitter<void>();
  }

  ngOnInit(): void {}

  trackByFn(index: number, option: ComboBoxOption<T>): string {
    return option.key;
  }

  ngOnDestroy(): void {
    // this.unsubscriber.next();
    this.unsubscriber.complete();
  }

  writeValue(value: T): void {
    // this.control.setValue(value || "");
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onSelectionChange(event: any) {
    this.selectionChange.next(event);
  }
}
