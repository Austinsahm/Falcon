import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DeviceDirectoryStoreService {
//   private deviceCategoryDirectory = new BehaviorSubject<
//   DeviceCategoryDirectory[]
// >([]);
// private deviceConfigDir = new BehaviorSubject<DeviceConfigurationDirectory[]>(
//   []
// );

  constructor(
    // private deviceCategoryAccessor: DeviceCategoryDataAccessService,
    // private readonly deviceDataAccessor: DeviceDataAccessService
  ) { }

  // getDeviceCategoryDirectory(
  //   subdomain: string,
  //   deviceCategName?: string,
  //   refresh?: boolean
  // ) {
  //   //check for param changes or behavior subject =0 before making new request
  //   if (
  //     refresh ||
  //     deviceCategName ||
  //     this.deviceCategoryDirectory.getValue().length === 0
  //   )
  //     this.deviceCategoryAccessor
  //       .getAccessor(subdomain, deviceCategName)
  //       .directory.fetch()
  //       .pipe(
  //         catchError((err) => {
  //           if (!err.status) {
  //             this.errMsgService.errorExist("You're probably offline");
  //           } else this.errMsgService.errorExist("Unknown Error occured");
  //           return of([]);
  //         }),
  //         tap((deviceCatDir) => this.deviceCategoryDirectory.next(deviceCatDir))
  //       )
  //       .subscribe();
  // }
}
