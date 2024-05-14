import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorLandingPageComponent } from './monitor-landing-page.component';

describe('MonitorLandingPageComponent', () => {
  let component: MonitorLandingPageComponent;
  let fixture: ComponentFixture<MonitorLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MonitorLandingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitorLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
