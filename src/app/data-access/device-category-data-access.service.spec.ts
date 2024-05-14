import { TestBed } from '@angular/core/testing';

import { DeviceCategoryDataAccessService } from './device-category-data-access.service';

describe('DeviceCategoryDataAccessService', () => {
  let service: DeviceCategoryDataAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceCategoryDataAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
