import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlarmReport } from 'src/app/models/device.model';
import { BaseHttpService } from './base-http.service';
import {
  Response,
  StatusCode,
  WriteResponsePayload,
} from 'src/app/models/http.model';

@Injectable({
  providedIn: 'root',
})
export class AlarmHttpService extends BaseHttpService {
  constructor(protected override readonly httpClient: HttpClient) {
    super(httpClient);
  }

  alarmReport(
    deviceId: string,
    startDate: string,
    endDate: string
  ): Observable<AlarmReport[]> {
    const url = this.buildUrl(
      `device/alarm-report/device-id/${deviceId}/startDate/${startDate}/endDate/${endDate}`
    );
    return this.check(this.httpClient.get<Response<AlarmReport[]>>(url), [
      StatusCode.NOT_FOUND,
      StatusCode.OK,
      StatusCode.SUCCESS,
    ]);
  }
}
