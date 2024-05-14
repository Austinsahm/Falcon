import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorDeviceListComponent } from './monitor-device-list.component';

describe('MonitorDeviceListComponent', () => {
  let component: MonitorDeviceListComponent;
  let fixture: ComponentFixture<MonitorDeviceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MonitorDeviceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitorDeviceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
