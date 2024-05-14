import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceManagementHomeComponent } from './device-management-home.component';

describe('DeviceManagementHomeComponent', () => {
  let component: DeviceManagementHomeComponent;
  let fixture: ComponentFixture<DeviceManagementHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DeviceManagementHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceManagementHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
