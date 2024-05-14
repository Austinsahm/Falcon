import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlPanelModalComponent } from './control-panel-modal.component';

describe('ControlPanelModalComponent', () => {
  let component: ControlPanelModalComponent;
  let fixture: ComponentFixture<ControlPanelModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ControlPanelModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlPanelModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
