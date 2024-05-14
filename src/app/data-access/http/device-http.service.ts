import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Device,
  DeviceCategoryDirectory,
  DeviceDetail,
} from 'src/app/models/device.model';
import { Response, StatusCode } from 'src/app/models/http.model';
import { BaseHttpService } from './base-http.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceHttpService extends BaseHttpService {
  userId: string;

  constructor(protected override readonly httpClient: HttpClient) {
    super(httpClient);
    this.userId = 'CUNvf6sEbwiAvMwsX';
  }

  /**
   * Fetches all available devices for the given subdomain
   * @param subdomain
   */
  fetch(subdomain: string, userId?: string): Observable<Device[]> {
    const url = this.buildUrl(
      `device/device-directory/list/companyId/${subdomain}/userId/${this.userId}`
    );
    return this.check(this.httpClient.get<Response<Device[]>>(url), [
      StatusCode.NOT_FOUND,
      StatusCode.OK,
      StatusCode.SUCCESS,
    ]);
  }

  /**
   * Fetches device categories directory for a given subdomain
   */
  fetchDirectory(subdomain: string): Observable<DeviceCategoryDirectory[]> {
    const url = this.buildUrl(
      `device/device-category-directory/companyId/${subdomain}`
    );
    return this.check(
      this.httpClient.get<Response<DeviceCategoryDirectory[]>>(url),
      [StatusCode.OK, StatusCode.NOT_FOUND]
    );
  }
}
