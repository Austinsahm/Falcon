import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Response,
  StatusCode,
  WriteResponsePayload,
} from 'src/app/models/http.model';
import { BaseHttpService } from './base-http.service';
import { Observable } from 'rxjs';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import {
  AddressData,
  DeviceCoordinates,
  FenceCategoryResponse,
  GeofencingHeaderResponse,
  ShapeDataForm,
} from 'src/app/models/gps.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardHttpService extends BaseHttpService {
  constructor(protected override readonly httpClient: HttpClient) {
    super(httpClient);
  }

  /**
   *
   * @param lat
   * @param lng
   * @returns
   */
  geofenceDetail(lat: string, lng: string): Observable<AddressData> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsApi}`;
    return this.httpClient.get<AddressData>(url);
  }

  geofenceSearchPoint(deviceId: string): Observable<any> {
    const url = this.buildUrl(
      `geofencing/device-location-search/deviceId/${deviceId}`
    );
    return this.check(this.httpClient.get<Response<any>>(url), [
      StatusCode.NOT_FOUND,
      StatusCode.OK,
      StatusCode.SUCCESS,
    ]);
  }

  geofenceTracing(
    deviceId: string,
    startDate: string,
    endDate: string
  ): Observable<DeviceCoordinates[]> {
    const url = this.buildUrl(
      `geofencing/device-tracing/deviceId/${deviceId}/startDate/${startDate}/endDate/${endDate}`
    );
    return this.check(this.httpClient.get<Response<DeviceCoordinates[]>>(url), [
      StatusCode.NOT_FOUND,
      StatusCode.OK,
      StatusCode.SUCCESS,
    ]);
  }

  generateGeofenceData(
    subdomain: string,
    deviceCatId: string,
    headerId: string
  ): Observable<ShapeDataForm> {
    const url = this.buildUrl(
      `reports/geofencing-specific/companyId/${subdomain}/clientDeviceCategId/${deviceCatId}/geoFencingHeaderId/${headerId}`
    );
    return this.check(this.httpClient.get<Response<ShapeDataForm>>(url), [
      StatusCode.NOT_FOUND,
      StatusCode.OK,
      StatusCode.SUCCESS,
    ]);
  }

  geofencingHeader(deviceId: string): Observable<GeofencingHeaderResponse[]> {
    const url = this.buildUrl(
      `geofencing/list-of-saved-geofencing/client_device_categ_id/${deviceId}`
    );
    return this.check(
      this.httpClient.get<Response<GeofencingHeaderResponse[]>>(url),
      [StatusCode.NOT_FOUND, StatusCode.OK, StatusCode.SUCCESS]
    );
  }

  fenceCategory(
    companyId: string,
    categoryId: string
  ): Observable<FenceCategoryResponse> {
    const url = this.buildUrl(
      `geofencing/geofences/company-id/${companyId}/category-id/${categoryId}`
    );
    return this.check(
      this.httpClient.get<Response<FenceCategoryResponse>>(url),
      [StatusCode.NOT_FOUND, StatusCode.OK, StatusCode.SUCCESS]
    );
  }

  deleteOneFence(headerId: string) {
    const url = this.buildUrl(`geofencing/geofences/header-id/${headerId}`);
    return this.check(
      this.httpClient.delete<Response<any>>(url),
      [StatusCode.NOT_FOUND, StatusCode.OK, StatusCode.SUCCESS]
    );
  }

  deleteAllFence(categoryId: string){
    const url = this.buildUrl(`geofencing/geofences/category-id/${categoryId}`);
    return this.check(
      this.httpClient.delete<Response<any>>(url),
      [StatusCode.NOT_FOUND, StatusCode.OK, StatusCode.SUCCESS]
    );
  }

  saveGeofencing(data: ShapeDataForm): Observable<WriteResponsePayload> {
    const url = this.buildUrl('geofencing/save');
    return this.checkWrite(
      this.httpClient.post<Response<WriteResponsePayload>>(url, data),
      [StatusCode.OK, StatusCode.CREATED]
    );
  }

  saveFence(data: FenceCategoryResponse): Observable<WriteResponsePayload> {
    const url = this.buildUrl('geofencing/save');
    return this.checkWrite(
      this.httpClient.post<Response<WriteResponsePayload>>(url, data),
      [StatusCode.OK, StatusCode.CREATED]
    );
  }

  dashboardDeviceList(companyId: string): Observable<DashboardDevice[]> {
    const url = this.buildUrl(
      `charts/dashboard-device-list/companyId/${companyId}`
    );
    return this.check(this.httpClient.get<Response<DashboardDevice[]>>(url), [
      StatusCode.NOT_FOUND,
      StatusCode.OK,
      StatusCode.SUCCESS,
    ]);
  }
}
