import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import { DeviceFormData } from 'src/app/models/device.model';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import { UserInfoService } from 'src/app/services/user-info.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  apiEndpoint: string;

  constructor(
    private http: HttpClient
  ) // private userInfoService: UserInfoService
  {
    this.apiEndpoint = environment.apiServerEndpoint;
  }

  getDeviceList(companyId: any, userId: any): Observable<any> {
    return this.http.get(
      `${this.apiEndpoint}/device/device-directory/list/companyId/${companyId}/userId/${userId}`
    );
  }

  getLastLocation(deviceId: string): Observable<any> {
    return this.http.get<{ response: any }>(
      `${this.apiEndpoint}/geofencing/device-tracing/last-location/deviceId/${deviceId}/`
    )      .pipe(map((data) => data.response));

  }

  // getDeviceList(companyId: any): Observable<any> {
  //   return this.http.get(`${this.apiEndpoint}/device/device-list/${companyId}`);
  // }

  // createDevice(reqbody: DeviceFormData): Observable<any> {
  //   return this.http.post(`${this.apiEndpoint}/device/save-device`, reqbody);
  // }

  createDevice(reqbody: DeviceFormData): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/device/save-tracker`, reqbody);
  }

  // getData():Observable<any> {
  //   return this.http.get<any[]>(`${this.apiEndpoint}/device/device-directory/list/companyId/abcltd/userId/US2674859595`);
  // }

  // getData(){
  //   return this.http.get(
  //     `${this.apiEndpoint}/charts/dashboard-device-list/companyId/abcltd`
  //   );
  // }

  // getData(): Observable<DashboardDevice[]> {
  //   return this.http.get<DashboardDevice[]>(`${this.apiEndpoint}/charts/dashboard-device-list/companyId/abcltd`)
  //     .pipe(map(data => data.response));
  // }

  // getData():Observable<DashboardDevice[]>{
  //   return this.http.get(response:DashboardDevice[]> (
  //     `${this.apiEndpoint}/charts/dashboard-device-list/companyId/abcltd`).pipe(map(data=>data.response))
  // );
  // }

  // getData():Observable<DashboardDevice[]>{
  //   return this.http.get<{response:DashboardDevice[]}> (
  //     `${this.apiEndpoint}/charts/dashboard-device-list/companyId/abcltd`
  //   ).pipe(map(data=>data.response));
  // }

  getData(companyId: any): Observable<DashboardDevice[]> {
    // console.log(companyId);

    return this.http
      .get<{ response: DashboardDevice[] }>(
        `${this.apiEndpoint}/device/gps-tracking-devices/companyid/${companyId}`
      )
      .pipe(map((data) => data.response));
  }
}
