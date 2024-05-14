import { TestBed } from '@angular/core/testing';

import { DeviceHttpService } from './device-http.service';

describe('DeviceHttpService', () => {
  let service: DeviceHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
