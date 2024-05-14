import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeviceCategoryDirectory } from 'src/app/models/device.model';
import { Response, StatusCode } from 'src/app/models/http.model';
import { BaseHttpService } from './base-http.service';


@Injectable({
  providedIn: 'root'
})
export class DeviceCategoryHttpService extends BaseHttpService {
      /**
     * Fetches device categories directory for a given subdomain
     */
      fetchDirectory(subdomain: string): Observable<DeviceCategoryDirectory[]> {
        const url = this.buildUrl(`device/device-category-directory/companyId/${subdomain}`);
        return this.check(
            this.httpClient.get<Response<DeviceCategoryDirectory[]>>(url),
            [StatusCode.OK, StatusCode.NOT_FOUND]
        );
    }

}
