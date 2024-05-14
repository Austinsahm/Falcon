import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboSelectFieldComponent } from './combo-select-field.component';

describe('ComboSelectFieldComponent', () => {
  let component: ComboSelectFieldComponent;
  let fixture: ComponentFixture<ComboSelectFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ComboSelectFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComboSelectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
