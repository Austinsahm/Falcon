import { TestBed } from '@angular/core/testing';

import { DeviceDirectoryStoreService } from './device-directory-store.service';

describe('DeviceDirectoryStoreService', () => {
  let service: DeviceDirectoryStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceDirectoryStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
