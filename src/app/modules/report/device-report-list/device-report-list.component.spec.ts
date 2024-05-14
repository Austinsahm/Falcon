import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceReportListComponent } from './device-report-list.component';

describe('DeviceReportListComponent', () => {
  let component: DeviceReportListComponent;
  let fixture: ComponentFixture<DeviceReportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DeviceReportListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
