import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovingOverviewComponent } from './moving-overview.component';

describe('MovingOverviewComponent', () => {
  let component: MovingOverviewComponent;
  let fixture: ComponentFixture<MovingOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MovingOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
