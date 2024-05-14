import { TestBed } from '@angular/core/testing';

import { DeviceCategoryHttpService } from './device-category-http.service';

describe('DeviceCategoryHttpService', () => {
  let service: DeviceCategoryHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceCategoryHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
