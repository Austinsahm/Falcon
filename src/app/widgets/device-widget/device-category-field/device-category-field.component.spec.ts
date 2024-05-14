import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceCategoryFieldComponent } from './device-category-field.component';

describe('DeviceCategoryFieldComponent', () => {
  let component: DeviceCategoryFieldComponent;
  let fixture: ComponentFixture<DeviceCategoryFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DeviceCategoryFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceCategoryFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
