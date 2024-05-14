import { TestBed } from '@angular/core/testing';

import { AlarmHttpService } from './alarm-http.service';

describe('AlarmHttpService', () => {
  let service: AlarmHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlarmHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
