import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeofencingComponent } from './geofencing.component';

describe('GeofencingComponent', () => {
  let component: GeofencingComponent;
  let fixture: ComponentFixture<GeofencingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ GeofencingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeofencingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
