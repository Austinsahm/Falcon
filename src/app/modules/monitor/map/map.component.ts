import {
  AfterViewInit,
  Component,
  ElementRef,
  ChangeDetectorRef,
  Input,
  OnInit,
  Output,
  EventEmitter,
  Renderer2,
  ViewChild,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GoogleMap } from 'src/app/widgets/sdk/google-map';
import { DashboardHttpService } from 'src/app/data-access/http/dashboard-http.service';
import {
  concatMap,
  forkJoin,
  interval,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import * as _moment from 'moment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  Points,
  Shape,
  ShapeName,
  RectPoints,
  ShapeDataForm,
  ShapeData,
  FenceCategoryResponse,
  FenceShape,
} from 'src/app/models/gps.model';
import { WriteStatusCode } from 'src/app/models/http.model';
import { ToastrService } from 'ngx-toastr';
import {
  MatSelect,
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';
import { DeviceDirectoryStoreService } from 'src/app/data-access/store/device-directory-store.service';
import { DeviceCategoryHttpService } from 'src/app/data-access/http/device-category-http.service';
import { DeviceCategoryDirectory } from 'src/app/models/device.model';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import { DeviceService } from '../../device-management/device.service';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { UserInfoService } from 'src/app/services/user-info.service';
import { LiveLocationService } from 'src/app/data-access/http/live-location.service';
import {} from '@angular/google-maps';
import { ControlPanelModalComponent } from 'src/app/widgets/control-panel-modal/control-panel-modal.component';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    ControlPanelModalComponent,
    MatInputModule,
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('map') mapElementRef!: ElementRef;
  // @ViewChild(ControlPanelModalComponent)
  // controlPanelModalComponent!: ControlPanelModalComponent;
  @ViewChild('modalDialog') modalDialog!: ElementRef;
  @ViewChild(ControlPanelModalComponent) controlPanelModal:
    | ControlPanelModalComponent
    | undefined;

  @ViewChild('deviceSelect') deviceSelect!: MatSelect;
  @ViewChild('deviceCategorySelect') deviceCategorySelect!: MatSelect;
  @ViewChild('fenceType') fenceType!: MatSelect;

  @Input() set devicesArray(devices: DashboardDevice[]) {
    this.deviceArr = devices;
    this.devices = devices;
    this.deviceLocation(devices);
    if (this.deviceArr) this.deviceArr.map((device) => this.loadData(device));
  }

  @Input() companyId!: string;
  @Input() subdomain!: string;

  map!: any;
  user: any;
  // map!: google.maps.Map;
  marker!: any;
  GoogleMap!: any;
  moment = _moment;
  fence!: FenceShape[];
  editedFence!: FenceShape[];
  geofencing: Shape[] = [];
  recGeoFence!: ShapeData;
  geofence: boolean = false;
  geofenceCount = 0;
  enableGeofence = false;
  drawnRectangle: any = [];
  drawnCircle: any = [];
  drawnPolygon: any = [];
  showPanorama: boolean = false;
  panorama: any;
  drawingManager: any;
  infoWindow: { infoWindow: any; code: string }[] = [];

  carAddress: { [deviceId: string]: string } = {};

  infoShapes: any = [];
  togglePanoramaState: boolean = false;
  headerId!: string;
  subscription!: Subscription;
  locations: any = [];
  lat!: number;
  lng!: number;
  devicePos: {
    [deviceId: string]: { lat: number; lng: number; time: string };
  } = {};
  deviceArr: DashboardDevice[] = [];
  // fenceArray!: Shape[];
  fenceArray!: FenceCategoryResponse;

  liveLocationSubscription!: Subscription;

  @Output() selectedTask = new EventEmitter<string>();

  form: FormGroup;
  myFence: FormGroup;
  isDeviceCategory!: string;
  myFenceCategory!: string;
  activeFenceId: string | null = null;

  @Input() deviceIds: string[] = [];

  options: any;
  category: DeviceCategoryDirectory[] = [];
  fenceLoading: boolean = false;

  // companyId = '';
  gprsStatus = [
    { fenceStatus: 'OUT' },
    { fenceStatus: 'IN' },
    { fenceStatus: 'BOTH' },
  ];
  bindByCategory: Boolean = false;
  devices: DashboardDevice[] = [];
  theCarMarker: any;
  isDarkModeEnabled: boolean = false;
  selectedDevice!: string;
  geoFenceCode: boolean = false;
  enableSaveButton: boolean = false;

  carMarkers: any[] = [];
  constructor(
    private mapLoader: GoogleMap,
    private renderer: Renderer2,
    private readonly dashboard: DashboardHttpService,
    private readonly fb: FormBuilder,
    private toastr: ToastrService,
    private readonly cd: ChangeDetectorRef,
    private gMapLoader: GoogleMap,
    private deviceDirStore: DeviceDirectoryStoreService,
    private deviceCategory: DeviceCategoryHttpService,
    private deviceService: DeviceService,
    private userInfo: UserInfoService,
    private liveLocation: LiveLocationService // private modalComponent: ControlPanelModalComponent
  ) {
    this.form = this.fb.group({
      newGeofence: ['', [Validators.required]],
      // deviceId: ['', [Validators.required]],
      // manufDeviceId: ['', [Validators.required]],
      code: ['', [Validators.required]],
      geoFenceStatus: ['', [Validators.required]],
    });

    this.myFence = this.fb.group({
      deviceCategory: ['', [Validators.required]],
    });

    //Device CATEGORY
    this.options = this._createSourceObservable();
    // console.log(this.category);
  }

  ngOnInit(): void {
    const darkModeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );
    if (darkModeMediaQuery) {
      this.isDarkModeEnabled = darkModeMediaQuery.matches;
    }

    // this.subscription = this.userInfo.getUser().subscribe((user) => {
    //   if (user) {
    //     this.companyId = user.userCompanyId;
    //     this.subdomain = user.userCompanyId;
    //     this.showNotificationWhileLoadingData();
    //   } else {
    //     this.toastr.error('Unknown Error', '');
    //   }
    // });

    // this.deviceService
    //   .getData(this.companyId)
    //   .pipe(
    //     switchMap((res) => {
    //       this.deviceArr = res;

    //       this.deviceArr.map((device) => {
    //         // return this.loadData(device);
    //       });

    //       const c = res.map((device) =>
    //         this.deviceService.getLastLocation(device.deviceId)
    //       );
    //       return forkJoin(c);
    //     })
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       res.map((el) => {
    //         if (el) {
    //           this.devicePos[el.deviceId] = {
    //             lat: el.lat,
    //             lng: el.lng,
    //             time: el.time,
    //           };

    //           const device = this.deviceArr.find(
    //             (dev) => dev.deviceId === el.deviceId
    //           );
    //           this.loadMarker(device!, this.devicePos[el.deviceId]);
    //         }
    //       });
    //     } else {
    //       this.hideNotificationAfterLoading();
    //       this.toastr.error('Unknown Error', '');
    //     }
    //   });
  }

  onDeviceSelectionChange(event: any) {
    // Assuming the value is directly the device name
    const selectedDeviceName = event.value;

    // Find the corresponding device object based on the name
    const selectedDevice = this.devices.find(
      (device) => device.deviceName === selectedDeviceName
    );

    if (selectedDevice) {
      // Update the form control
      this.form.patchValue({
        deviceId: selectedDevice.deviceId,
        manufDeviceId: selectedDevice.manufDeviceId,
      });
    }
  }

  onGeofenceSelectionChange(event: any) {
    // Assuming the value is directly the geofence status
    const selectedGeofenceStatus = event.value;

    // Update the form control
    this.form.patchValue({
      geoFenceStatus: selectedGeofenceStatus,
    });
  }

  // Function to show a notification while loading data
  private showNotificationWhileLoadingData() {
    this.toastr.info('Loading data...', 'Please wait', {
      timeOut: 0, // Set timeOut to 0 to make it a sticky notification
      progressBar: true,
    });
  }

  deviceLocation(devices: DashboardDevice[]) {
    if (!devices || !devices.length) return;
    const devicesLocation$ = devices.map((device) =>
      this.deviceService.getLastLocation(device.deviceId)
    );

    forkJoin(devicesLocation$).subscribe((res) => {
      if (res) {
        res.map((el) => {
          if (el !== null) {
            this.devicePos[el.deviceId] = {
              lat: el.lat,
              lng: el.lng,
              time: el.time,
            };

            const device = this.deviceArr.find(
              (dev) => dev.deviceId === el.deviceId
            );
            this.loadMarker(device!, this.devicePos[el.deviceId]);
          }
        });
      } else {
        this.hideNotificationAfterLoading();
        this.toastr.error('Unknown Error', '');
      }
    });
  }

  // Function to hide the notification when loading is done
  private hideNotificationAfterLoading() {
    this.toastr.clear();
  }

  // Control Panel- To set command for the tracker
  controlPanel(device: DashboardDevice) {
    this.controlPanelModal!.device = device;
    // console.log(this.controlPanelModal);

    this.modalDialog.nativeElement.showModal();
  }

  customInfoHTML(
    device: DashboardDevice,
    pos: { lat: number; lng: number; time: string }
  ) {
    const container = this.renderer.createElement('div');
    this.renderer.setStyle(container, 'padding-bottom', '0.1rem');

    // Create the device name element
    const name = this.renderer.createElement('h2');
    this.renderer.addClass(name, 'firstHeading');
    this.renderer.appendChild(
      name,
      this.renderer.createText(device.deviceName)
    );

    // Create the address element
    const address = this.renderer.createElement('div');
    const addressText = this.renderer.createText(
      `Address: ${this.carAddress[device.deviceId]}`
    );
    this.renderer.appendChild(address, addressText);

    // Create the status element
    const status = this.renderer.createElement('div');
    const statusText = this.renderer.createText('Status: Online');
    this.renderer.appendChild(status, statusText);

    // Create the IMEI element
    const imei = this.renderer.createElement('div');
    const imeiText = this.renderer.createText(`IMEI: ${device.manufDeviceId}`);
    this.renderer.appendChild(imei, imeiText);

    // Create the latitude and longitude elements
    const latLngContainer = this.renderer.createElement('div');
    const latitude = this.renderer.createElement('div');
    const latitudeText = this.renderer.createText(`Latitude: ${pos.lat}`);
    this.renderer.appendChild(latitude, latitudeText);
    const longitude = this.renderer.createElement('div');
    const longitudeText = this.renderer.createText(`Longitude: ${pos.lng}`);
    this.renderer.appendChild(longitude, longitudeText);
    this.renderer.appendChild(latLngContainer, latitude);
    this.renderer.appendChild(latLngContainer, longitude);

    // Create the last seen element
    const lastSeen = this.renderer.createElement('div');
    const lastSeenText = this.renderer.createText(`Last Seen: ${pos.time}`);
    this.renderer.appendChild(lastSeen, lastSeenText);

    // Create the control panel button
    const button = this.renderer.createElement('button');
    this.renderer.addClass(button, 'operate');
    this.renderer.addClass(button, 'rounded-md');
    this.renderer.addClass(button, 'px-2');
    this.renderer.addClass(button, 'py-2');
    this.renderer.addClass(button, 'bg-blue-500');
    this.renderer.addClass(button, 'text-white');
    this.renderer.addClass(button, 'hover:bg-blue-700');
    this.renderer.addClass(button, 'hover:text-white');
    this.renderer.listen(button, 'click', () => this.controlPanel(device));

    const buttonText = this.renderer.createText('Control Panel');
    this.renderer.appendChild(button, buttonText);

    // Append all elements to the container
    this.renderer.appendChild(container, name);
    this.renderer.appendChild(container, address);
    this.renderer.appendChild(container, status);
    this.renderer.appendChild(container, imei);
    this.renderer.appendChild(container, latLngContainer);
    this.renderer.appendChild(container, lastSeen);
    this.renderer.appendChild(container, button);

    return container;
  }

  infoTab(
    carMarker: any,
    device: DashboardDevice,
    pos: { lat: number; lng: number; time: string }
  ) {
    const summaryContentString =
      '<style>.gm-ui-hover-effect { top: 5px;right: 5px;}</style>' +
      '<div id="content" >' +
      '<div id="siteNotice">' +
      '</div>' +
      '<div style="width: 100%;display: flex;justify-content: center;align-items: center;">' +
      '<h2 id="firstHeading" class="firstHeading" style="margin-bottom: 0px;">' +
      device.deviceName +
      '</h2>' +
      '</div>' +
      '<div id="bodyContent">' +
      '<div class="row" > <div><span style="font-weight: bold;" >Online</span>' +
      '</div></div> ' +
      '</div>' +
      '</div>';

    const infowindow = new google.maps.InfoWindow({
      content: this.customInfoHTML(device, pos),
      ariaLabel: 'Device Information',
    });

    const summaryInfoWindow = new google.maps.InfoWindow({
      content: summaryContentString,
      ariaLabel: 'Summary Device Information',
      // pixelOffset: new google.maps.Size(0, -this.marker.icon.size.height) // Adjust vertical offset
    });

    carMarker.addListener('click', () => {
      // infowindow.open({
      //   anchor: this.marker,
      //   map: this.map,
      // });
      infowindow.open({ map: this.map, anchor: carMarker });
    });

    carMarker.addListener('mouseover', () => {
      summaryInfoWindow.open({
        anchor: this.marker,
        map: this.map,
        // shouldFocus: false, // Prevent the info window from grabbing focus
        // pixelOffset: new google.maps.Size(0, -this.marker.icon.size.height) // Adjust vertical offset
      });
    });

    carMarker.addListener('mouseout', () => {
      summaryInfoWindow.close();
    });
  }

  loadMarker(
    device: DashboardDevice,
    pos: { lat: number; lng: number; time: string }
  ) {
    // console.log(device, 'devices');
    let fillColor: string;

    // Check the device status and set the fillColor accordingly
    if (device.deviceStatus === 'offline') {
      fillColor = '#646464'; // Set the color for offline status
    } else {
      fillColor = '#00FF00'; // Set the default color for online status
    }

    //check for duplicate marker instance
    const foundCarMarker = this.carMarkers.find(
      (el) => el.device === device.deviceId
    );
    if (foundCarMarker) {
      foundCarMarker.marker.setMap(null);
    }

    const car = {
      path: 'M292.2,0C131.08,0,0,131.08,0,292.21c0,97.34,89.53,251,128,312.49,31.67,50.62,65.66,98.74,95.72,135.51C272.62,800,286.34,800,292.21,800c5.62,0,18.8,0,67.51-59.81,30.13-37,64.15-85.11,95.8-135.47,38.75-61.68,128.9-215.6,128.9-312.51C584.42,131.08,453.33,0,292.2,0Zm0,528.25C164.74,528.25,61,424.55,61,297.08S164.74,65.91,292.21,65.91s231.17,103.7,231.17,231.17S419.68,528.25,292.21,528.25ZM461,208.38a18.46,18.46,0,0,0-4.88.68l-18.56,5.11-19.27-46.95c-5.47-13.3-21.61-24.13-36-24.13H201.88c-14.38,0-30.52,10.83-36,24.13l-19.25,46.89-18.32-5.05a18.54,18.54,0,0,0-4.89-.68c-8.77,0-15.14,6.7-15.14,15.93v10.95a19.57,19.57,0,0,0,19.55,19.55H130l-3.11,7.57c-5.07,12.36-9.2,33.28-9.2,46.64V402.3a19.57,19.57,0,0,0,19.54,19.55h25.54a19.58,19.58,0,0,0,19.55-19.55V379H401.9V402.3a19.57,19.57,0,0,0,19.55,19.55H447a19.57,19.57,0,0,0,19.55-19.55V309c0-13.36-4.13-34.28-9.2-46.64l-3.11-7.57h2.36a19.57,19.57,0,0,0,19.55-19.55V224.31C476.11,215.08,469.75,208.38,461,208.38Zm-300.3,35.81,29.16-71c3.26-8,13-14.46,21.57-14.46H372.76c8.6,0,18.3,6.51,21.57,14.46l29.16,71c3.27,8-1.1,14.46-9.7,14.46H170.37C161.77,258.65,157.41,252.15,160.67,244.19ZM225.76,334a7.84,7.84,0,0,1-7.82,7.82H162.56a7.84,7.84,0,0,1-7.82-7.82V307.44a7.84,7.84,0,0,1,7.82-7.82h55.38a7.84,7.84,0,0,1,7.82,7.82Zm203.14,0a7.84,7.84,0,0,1-7.82,7.82H365.7a7.84,7.84,0,0,1-7.82-7.82V307.44a7.84,7.84,0,0,1,7.82-7.82h55.38a7.84,7.84,0,0,1,7.82,7.82Z',
      fillColor: fillColor,
      fillOpacity: 1,
      strokeWeight: 0.5,
      strokeColor: '#000000',
      rotation: 0,
      scale: 0.055,
      anchor: new google.maps.Point(250, 680),
    };

    if (
      pos.lat !== 0.0 &&
      pos.lng !== 0.0 &&
      pos.lat !== undefined &&
      pos.lng !== undefined
    ) {
      const theCarMarker = new this.GoogleMap.Marker({
        icon: car,
        // title: "static text",
        position: { lat: pos.lat, lng: pos.lng },
        map: this.map,
        // Animation: google.maps.Animation.DROP,
      });
      this.fetchGoogleStreet(theCarMarker, device, pos);

      // console.log(this.carAddress[device.deviceId], 'DEvice Name');

      //fit bound
      const bounds = new this.GoogleMap.LatLngBounds();

      bounds.extend(theCarMarker.getPosition());
      this.map.fitBounds(bounds);

      //get zoom to fit bound
      const zoom = this.map.getZoom();
      this.map.setZoom(zoom > 10 ? 16 : zoom);

      //save all marker instance
      this.carMarkers.push({ device: device.deviceId, marker: theCarMarker });
    }

    this.hideNotificationAfterLoading();
  }

  loadData(device: DashboardDevice) {
    this.liveLocation.liveLocation(device.deviceId).subscribe((pos) => {
      console.log(pos, 'live location');
      if (this.devicePos[device.deviceId] !== undefined) {
        if (
          this.devicePos[device.deviceId].lat !== pos.lat ||
          this.devicePos[device.deviceId].lng !== pos.lng
        ) {
          this.devicePos[device.deviceId] = {
            lat: pos.lat,
            lng: pos.lng,
            time: pos.time,
          };
          this.loadMarker(device, pos);
        }
      }
    });

    this.liveLocation.deviceStatus(device.deviceId).subscribe((status) => {
      if (status?.status === 'online') device.deviceStatus = status.status;
      if (status?.status === 'offline') device.deviceStatus = status.status;
      this.loadMarker(device, this.devicePos[device.deviceId]);
    });
  }

  ngOnChanges(changes: any): void {
    // console.log(this.deviceIds);

    if (this.deviceIds) {
      this.deviceIds.forEach((deviceId) => {
        console.log(deviceId);
        this.dashboard
          .geofenceSearchPoint(deviceId)
          .pipe(
            concatMap((res) => {
              if (res.latitude === 0 && res.longitude == 0) {
              }
              return this.dashboard
                .geofenceDetail(res.latitude, res.longitude)
                .pipe(
                  map((address) => {
                    if (
                      !address ||
                      !address.results ||
                      !address.results.length
                    ) {
                      address.results.push({
                        formatted_address:
                          '<div>device address unavailable at the moment</div',
                      });
                    }
                    const formatted_address = `<div style="color:black">${address.results[0].formatted_address}</div`;
                    //marker object
                    this.marker = new this.GoogleMap.Marker({
                      icon: '',
                      // title: "static text",
                      position: { lat: res.latitude, lng: res.longitude },
                      map: this.map,
                      // Animation: google.maps.Animation.DROP,
                    });

                    //fit bound
                    const bounds = new this.GoogleMap.LatLngBounds();

                    bounds.extend(this.marker.getPosition());
                    this.map.fitBounds(bounds);

                    //get zoom to fit bound
                    const zoom = this.map.getZoom();
                    this.map.setZoom(zoom > 10 ? 16 : zoom);
                  })
                );
            })
          )
          .subscribe();

        // this.marker = new this.GoogleMap.Marker({
        //   icon: "",
        //   position: { lat: 7.458140017025983, lng: 8.033788507926914 },
        //   map: this.map,
        // });
      });
    }
  }

  ngAfterViewInit(): void {
    this.mapLoader
      .loadGoogleMap()
      .then((googleMap) => {
        this.GoogleMap = googleMap;

        // Check if dark mode is enabled (you need to replace 'isDarkModeEnabled' with your actual variable)

        const defaultControls = {
          zoom: 5,
          streetViewControl: false,
          center: { lat: 6.5244, lng: 3.3792 },
        };

        const darkModeControls = {
          ...defaultControls,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            {
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#242f3e' }],
            },
            {
              elementType: 'labels.text.fill',
              stylers: [{ color: '#746855' }],
            },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#d59563' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#d59563' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{ color: '#263c3f' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#6b9a76' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#38414e' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#212a37' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#9ca5b3' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#746855' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#1f2835' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#f3d19c' }],
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{ color: '#2f3948' }],
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#d59563' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#17263c' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#515c6d' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#17263c' }],
            },
          ],
        };

        const controls = this.isDarkModeEnabled
          ? darkModeControls
          : defaultControls;

        const mapElement = this.mapElementRef.nativeElement;

        this.map = new googleMap.Map(mapElement, controls);

        googleMap.event.addListenerOnce(this.map, 'idle', () => {
          this.renderer.addClass(mapElement, 'visible');
        });

        // this.loadData();
      })
      .catch((e) => this.toastr.error('Map cannot be loaded', ''));

    // this.devicesCategory(this.isDeviceCategory);
  }

  devicesCategory(deviceCateforyId: MatSelectChange) {
    this.isDeviceCategory = deviceCateforyId.value;
  }

  fenceCategory(deviceCateforyId: MatSelectChange) {
    this.fenceLoading = true;
    this.myFenceCategory = deviceCateforyId.value;
    this.onClearShapes();

    console.log(this.infoShapes, 'Info Shapes');

    this.infoShapes.map((shape: any) => {
      shape.shape.setMap(null);
    });
    this.infoWindow.map((info) => {
      info.infoWindow.close();
    });

    //edit and view map details
    this.dashboard
      .fenceCategory(this.companyId, this.myFenceCategory)
      .subscribe((data) => {
        this.fenceArray = data;
        console.log(this.fenceArray);
        this.fenceLoading = false;
      });

    // this.headerId = '';
    // this.geofencing = [];

    //edit and view map details
    // this.dashboard
    // .geofencingHeader(this.isDeviceCategory)
    // .pipe(
    //   concatMap((data) => {
    //     //show drawing tools once
    //     if (!this.drawingManager) this.showGeofencingTools();
    //     if (data.length) {
    //       this.enableGeofence = true;
    //       this.form.patchValue({
    //         newGeofence: data[data.length - 1].geofencing_hder_name,
    //       });
    //       return this.dashboard
    //         .generateGeofenceData(
    //           this.companyId,
    //           this.isDeviceCategory,
    //           data[data.length - 1].geofencing_hder_id
    //         )
    //         .pipe(concatMap((shapes) => of(this.ondrawGeofence(shapes))));
    //     } else {
    //       this.enableGeofence = false;
    //       this.form.patchValue({ newGeofence: '' });
    //       this.onClearShapes();
    //       return of();
    //     }
    //   })
    // )
    // .subscribe();
  }

  showFenceOnMap(headerId: string) {
    this.activeFenceId = headerId;
    const shape = this.fenceArray.shapes.find((fence) => {
      return fence.headerId === headerId;
    });
    console.log(shape, 'Selected Shape');

    // if (!this.drawingManager) this.showGeofencingTools();

    if (shape) {
      // console.log(shape, 'Selected Shape');

      // if (!this.drawingManager) this.showGeofencingTools();

      this.ondrawFence(shape);
    } else {
      // console.log('Shape not found for the given headerId');
    }
  }

  deleteOneFence(headerId: string, headerName: string) {
    this.dashboard.deleteOneFence(headerId).subscribe(
      (res) => {
        console.log(res);

        if (res.status === 'OK') {
          this.toastr.success(headerName + ' fence deleted', 'Geofencing');
          // Find the index of the element
          const fenceToRemove = this.fenceArray.shapes.findIndex((fence) => {
            return fence.headerName === headerName;
          });

          // Remove the element if the index is found
          if (fenceToRemove !== -1) {
            this.fenceArray.shapes.splice(fenceToRemove, 1);
          }
        } else {
          this.toastr.error('Error Deleting Geofence', '');
        }
      },
      (error) => {
        this.selectedTask.emit('search');
        if (!error.status) this.toastr.error(error);
        else this.toastr.error('Unknown Error', '');
      }
    );
  }

  deleteAllFence(category: string) {
    this.dashboard.deleteAllFence(category).subscribe(
      (res) => {
        console.log(res);

        console.log(res);

        if (res.status === 'OK') {
          this.toastr.success(
            category + ' category fence deleted',
            'Geofencing'
          );
          this.fenceArray.shapes = [];
        } else {
          this.toastr.error('Error Deleting Geofences', '');
        }
      },
      (error) => {
        this.selectedTask.emit('search');
        if (!error.status) this.toastr.error(error);
        else this.toastr.error('Unknown Error', '');
      }
    );
  }

  geoFence() {
    this.geofence = !this.geofence;
    this.showGeofencingTools();
    // const subdomain = 'abcltd';
    this.deviceCategory.fetchDirectory(this.subdomain).subscribe((res) => {
      this.category = res;
    });
  }

  cancel() {
    this.geofence = !this.geofence;
    this.drawingManager.setMap(null);
    this.infoShapes.map((shape: any) => {
      shape.shape.setMap(null);
    });
    this.infoWindow.map((info) => {
      info.infoWindow.close();
    });
    this.form.reset();
    this.myFence.reset();
    this.fenceArray.shapes = [];
    this.deviceCategorySelect.value = null;
    this.fenceType.value = null;
    this.deviceSelect.value = null;
  }

  toggleView(): void {
    this.togglePanoramaState = this.panorama.getVisible();

    if (this.togglePanoramaState === false) {
      this.panorama.setVisible(true);
    } else {
      this.panorama.setVisible(false);
    }

    // this controls the template state
    this.togglePanoramaState = !this.togglePanoramaState;
  }

  updateMapView(): void {
    this.map.addListener('click', (mouseEvent: any) => {
      // this.fetchGoogleStreet({
      //   lat: mouseEvent.latLng.lat(),
      //   lng: mouseEvent.latLng.lng(),
      // });
    });
  }

  onCreate() {
    // console.log(this.form.value);

    let command = {
      action: 'set-geofence',
      deviceId: this.form.get('deviceId')?.value,
      manufDeviceId: this.form.get('manufDeviceId')?.value,
      geoFenceName: this.form.get('newGeofence')?.value,
      geoFenceStatus: this.form.get('geoFenceStatus')?.value,
      shape: this.recGeoFence,
    };

    // console.log(command);

    // this.liveLocation.setFence(command).subscribe((res) => {
    //   console.log(res);
    // });

    // const formdata = {
    //   headerName: geofenceName,
    //   categoryId: this.isDeviceCategory,
    //   // categoryId: 'connect',
    //   shapes: this.geofencing,
    //   headerId: this.headerId,
    // };

    this.fence[0].headerName = this.form.get('newGeofence')?.value;
    this.fence[0].fenceType = this.form.get('geoFenceStatus')?.value;

    const fenceForm = {
      categoryId: this.isDeviceCategory,
      shapes: this.fence,
    };

    console.log(fenceForm);

    this.dashboard.saveFence(fenceForm).subscribe(
      (res) => {
        console.log(res);
        if (res.status === WriteStatusCode.SUCCESS) {
          this.toastr.success('New Geofence Created', 'Geofencing');
          // this.drawingManager.setMap(null);
          this.infoShapes.map((shape: any) => {
            shape.shape.setMap(null);
          });
          this.infoWindow.map((info) => {
            info.infoWindow.close();
          });
          this.form.reset();
          this.myFence.reset();
          this.deviceCategorySelect.value = null;
          this.fenceType.value = null;
          // this.selectedTask.emit('search');
          // this.cd.markForCheck();
        } else {
          this.toastr.error('Error creating Geofence', '');
        }
      },
      (error) => {
        // this.selectedTask.emit('search');
        if (!error.status) this.toastr.error(error);
        else this.toastr.error('Unknown Error', '');
      }
    );

    // this.dashboard.saveGeofencing(formdata).subscribe(
    //   (res) => {
    //     if (res.status === WriteStatusCode.SUCCESS) {
    //       this.toastr.success('New Geofence Created', 'Geofencing');
    //       this.selectedTask.emit('search');
    //       this.cd.markForCheck();
    //     } else {
    //       this.toastr.error('Error creating Geofence', '');
    //     }
    //   },
    //   (error) => {
    //     this.selectedTask.emit('search');
    //     if (!error.status) this.toastr.error(error);
    //     else this.toastr.error('Unknown Error', '');
    //   }
    // );
  }

  saveEditedFence(fenceArray: FenceCategoryResponse, headerId: string) {
    console.log(headerId);

    const fenceEditedIndex = this.fenceArray.shapes.findIndex(
      (fence) => fence.headerId === headerId
    );

    const fenceForm = {
      categoryId: fenceArray.categoryId,
      shapes: this.editedFence,
    };

    console.log(fenceForm);
    this.dashboard.saveFence(fenceForm).subscribe(
      (res) => {
        console.log(res);
        if (res.status === WriteStatusCode.SUCCESS) {
          this.toastr.success('Edited Successfully', 'Geofencing');
          this.drawingManager.setMap(null);
          this.infoShapes.map((shape: any) => {
            shape.shape.setMap(null);
          });
          this.infoWindow.map((info) => {
            info.infoWindow.close();
          });
          this.form.reset();
          this.myFence.reset();

          this.dashboard
            .fenceCategory(this.companyId, this.myFenceCategory)
            .subscribe((data) => {
              this.fenceArray = data;
              console.log(this.fenceArray);
              this.fenceLoading = false;
            });
          // this.selectedTask.emit('search');
          // this.cd.markForCheck();
        } else {
          this.toastr.error('Error Editing Geofence', '');
        }
      },
      (error) => {
        // this.selectedTask.emit('search');
        if (!error.status) this.toastr.error(error);
        else this.toastr.error('Unknown Error', '');
      }
    );
  }

  geofenceCode(): string {
    this.geofenceCount = this.geofenceCount + 1;
    if (this.geofenceCount >= 1) {
      this.enableGeofence = true;
      this.cd.markForCheck();
      this.geoFenceCode = true;
    }
    // let code = prompt('Please, enter the geofencing code') || '';
    let code = this.form.get('code')?.value;

    return code;
  }

  ondrawGeofence(shapes: ShapeDataForm): void {
    this.headerId = !shapes ? '' : shapes.headerId;
    const data = !shapes ? [] : shapes.shapes;
    this.geofencing = data;
    // this.fence = data;
    this.onClearShapes();

    this.infoShapes = [];

    this.addShapesToMap(data);

    this.fitShapeToMap(data);
  }

  ondrawFence(shapes: FenceShape): void {
    // this.headerId = !shapes ? '' : shapes.headerId;
    const data = shapes;
    // this.geofencing = data;
    // this.fence = data;
    this.onClearShapes();

    this.infoShapes = [];

    // this.addShapesToMap(data);
    this.addFenceToMap(data);

    // this.fitShapeToMap(data);
  }

  private fitShapeToMap(shapes: Shape[]): void {
    let points; //= new Array()
    const bounds = new this.GoogleMap.LatLngBounds();
    for (let counter = 0; counter < shapes.length; counter++) {
      switch (shapes[counter].name) {
        case ShapeName.rect:
          // points = new this.GoogleMap.LatLng(
          //   this.drawnRectangle.getBounds().getNorthEast().lat(),
          //   this.drawnRectangle.getBounds().getNorthEast().lng()
          // );
          // bounds.extend(points);

          // points = new this.GoogleMap.LatLng(
          //   this.drawnRectangle.getBounds().getSouthWest().lat(),
          //   this.drawnRectangle.getBounds().getSouthWest().lng()
          // );
          // bounds.extend(points);
          bounds.union(this.drawnRectangle[counter].getBounds());

          break;

        case ShapeName.circle:
          // console.log(circles);

          // circles.forEach((el) => {
          //   console.log(el[0]);

          //   bounds.union(new this.GoogleMap.LatLng(el[0].lat, el[0].lng).getBounds());
          // });

          // points = new this.GoogleMap.LatLng(
          //   this.drawnCircle.getBounds().getNorthEast().lat(),
          //   this.drawnCircle.getBounds().getNorthEast().lng()
          // );
          // bounds.extend(points);

          // points = new this.GoogleMap.LatLng(
          //   this.drawnCircle.getBounds().getSouthWest().lat(),
          //   this.drawnCircle.getBounds().getSouthWest().lng()
          // );
          // bounds.extend(points);
          bounds.union(this.drawnCircle[counter].getBounds());
          break;

        case ShapeName.polygon:
          this.drawnPolygon[counter].getPaths().forEach((path: any) => {
            path.forEach((latlng: any) => {
              bounds.extend(latlng);
            });
          });

        // for (let aa=0; aa < circles.length; aa++) {
        //    points = new google.maps.LatLng(circles[aa][0], circles[aa][0]);
        //   bounds.extend(points);
        // }
        // break;
      }
      this.map.fitBounds(bounds);
    }
  }

  onClearShapes() {
    console.log(this.infoShapes);
    if (this.drawnCircle.length) {
      for (let i = 0; i < this.drawnCircle.length; i++)
        if (this.drawnCircle[i]) this.drawnCircle[i].setMap(null);
      this.drawnCircle = [];
    }
    if (this.drawnRectangle.length) {
      for (let i = 0; i < this.drawnRectangle.length; i++)
        if (this.drawnRectangle[i]) this.drawnRectangle[i].setMap(null);
      this.drawnRectangle = [];
    }
    if (this.drawnPolygon.length) {
      for (let i = 0; i < this.drawnPolygon.length; i++)
        if (this.drawnPolygon[i]) this.drawnPolygon[i].setMap(null);
      this.drawnPolygon = [];
    }
  }

  fetchGoogleStreet(carMarker: any, device: DashboardDevice, pos?: any): void {
    const location = carMarker.position;
    const deviceId = device.deviceId;

    new this.GoogleMap.StreetViewService()
      .getPanorama({
        location,
        radius: 100,
      })
      .then((el: any) => {
        this.showPanorama = true;
        // console.log(el.data.location.description);

        this.carAddress[deviceId] = el.data.location.description;
        this.infoTab(carMarker, device, pos);
        this.processStreetViewData(el.data);
      })
      .catch(() => (this.showPanorama = false));
  }

  processStreetViewData(
    data: any
    // device: DashboardDevice,
    // pos?: any,
    // carMarker?: any
  ) {
    const location = data.location;

    // if (device.deviceId) {
    //   this.carAddress[device.deviceId] = location.description;
    //   console.log(this.carAddress[device.deviceId]);
    // }

    this.panoramaView(location.pano);
  }

  panoramaView(location: Points): void {
    this.panorama = this.map.getStreetView();

    this.panorama.setPano(location);

    this.panorama.setPov({ heading: 265, pitch: 0 });

    this.map.setStreetView(this.panorama);
  }

  onTabChange(event: MatTabChangeEvent) {
    if (event.tab.textLabel === 'My Fence') {
      this.drawingManager.setMap(null);
      this.activeFenceId = null;
      this.deviceCategorySelect.value = null;
      this.fenceType.value = null;
      this.form.reset();
    } else if (event.tab.textLabel === 'Set Fence') {
      this.drawingManager.setMap(this.map);
      this.infoShapes.map((shape: any) => {
        shape.shape.setMap(null);
      });
      this.infoWindow.map((info) => {
        info.infoWindow.close();
      });
      this.fenceArray.shapes = [];
      this.myFence.reset();
      this.deviceSelect.value = null;
    }
  }

  // Function to check if the current fence is the active fence
  isCurrentFenceActive(fenceId: string): boolean {
    return this.activeFenceId === fenceId;
  }

  private showGeofencingTools() {
    const drawingManager = new this.GoogleMap.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        position: this.GoogleMap.ControlPosition.TOP_CENTER,
        drawingModes: [
          this.GoogleMap.drawing.OverlayType.CIRCLE,
          this.GoogleMap.drawing.OverlayType.POLYGON,
          // this.GoogleMap.drawing.OverlayType.POLYLINE,
          this.GoogleMap.drawing.OverlayType.RECTANGLE,
        ],
      },
    });

    drawingManager.setMap(this.map);

    this.GoogleMap.event.addListener(
      drawingManager,
      'overlaycomplete',
      (event: any) => {
        this.enableSaveButton = true;

        if (this.fence) {
          console.log(this.fence, 'Fence');
          this.infoShapes.map((shape: any) => {
            shape.shape.setMap(null);
          });
          this.infoWindow.map((info) => {
            info.infoWindow.close();
          });
        }

        //edit the overlay with editing tools
        this.shapeOverlay(event, this.geofenceCode());

        //delete the original shape
        event.overlay.setMap(null);

        //deactivate the drawing poiter
        drawingManager.setDrawingMode(null);
      }
    );
    this.drawingManager = drawingManager;
  }

  shapeOverlay(event: any, code: string): void {
    if (event.type === 'circle') {
      const radius = event.overlay.getRadius();
      const lat = event.overlay.getCenter().lat();
      const lng = event.overlay.getCenter().lng();
      const circle = {
        points: [{ lat, lng }],
        name: ShapeName.circle,
        radius,
        code,
      };

      const WebSocketCircle = {
        points: [{ lat, lng }],
        name: ShapeName.circle,
        radius,
        code,
        headerName: '',
        fenceType: '',
      };

      this.geofencing.push(circle);
      // this.fence = WebSocketCircle;
      this.fence = [WebSocketCircle];

      this.recGeoFence = WebSocketCircle;
      this.addShapesToMap([circle]);
    }

    if (event.type === 'polygon') {
      const coords = event.overlay
        .getPath()
        .getArray()
        .map((coord: any, i: any) => ({
          lat: coord.lat(),
          lng: coord.lng(),
          index: i,
        }));
      const polygon = {
        points: coords,
        name: ShapeName.polygon,
        code,
        headerName: '',
        fenceType: '',
      };
      this.geofencing.push(polygon);
      this.fence = [polygon];
      this.addShapesToMap([polygon]);
      this.recGeoFence = polygon;
    }

    if (event.type === 'rectangle') {
      console.log(event);

      const bounds = event.overlay.getBounds();
      const north = bounds.getNorthEast().lat();
      const south = bounds.getSouthWest().lat();
      const east = bounds.getNorthEast().lng();
      const west = bounds.getSouthWest().lng();

      //  Get the coordinates for each corner
      const southwest = bounds.getSouthWest(); // Bottom-left corner
      const northeast = bounds.getNorthEast(); // Top-right corner
      const northwest = new google.maps.LatLng(
        northeast.lat(),
        southwest.lng()
      ); // Top-left corner
      const southeast = new google.maps.LatLng(
        southwest.lat(),
        northeast.lng()
      ); // Bottom-right corner

      const height = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(bounds.toJSON().north, bounds.toJSON().east),
        new google.maps.LatLng(bounds.toJSON().south, bounds.toJSON().east)
      );

      const width = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(bounds.toJSON().north, bounds.toJSON().east),
        new google.maps.LatLng(bounds.toJSON().north, bounds.toJSON().west)
      );

      const rect = {
        points: [{ east, north, south, west }],
        name: ShapeName.rect,
        code,
      };
      const webSocketRect = {
        points: [
          { lat: northwest.lat(), lng: northwest.lng(), index: 0 },
          { lat: northeast.lat(), lng: northeast.lng(), index: 1 },
          { lat: southeast.lat(), lng: southeast.lng(), index: 2 },
          { lat: southwest.lat(), lng: southwest.lng(), index: 3 },
        ],
        name: ShapeName.rect,
        code,
        // height,
        // width,
        headerName: '',
        fenceType: '',
      };
      this.geofencing.push(rect);
      // this.fence = webSocketRect;
      this.fence = [webSocketRect];
      this.recGeoFence = webSocketRect;
      this.addShapesToMap([rect]);
    }

    // this.GoogleMap.event.removeListener(event)
  }

  private addFenceToMap(shape: FenceShape): void {
    const code = shape.code;
    if (shape.name === ShapeName.polygon || ShapeName.rect) {
      const point = <Points[]>shape.points;
      const drawnPolygon = new this.GoogleMap.Polygon({
        paths: shape.points,
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: 0.35,
        draggable: true,
        editable: true,
      });
      drawnPolygon.setMap(this.map);
      // this.fetchGoogleStreet({
      //   lat: point[0]['lat'],
      //   lng: point[0]['lng'],
      // })

      this.drawnPolygon.push(drawnPolygon);

      // this.bounds.extend(this.drawnPolygon.getBounds());
      this.infoShapes.push({ shape: drawnPolygon, code });

      //listen to drag event and update the shape data accordingly
      ['insert_at', 'remove_at', 'set_at', 'dragend'].forEach((eventName) => {
        drawnPolygon.getPath().addListener(eventName, () => {
          const coords = drawnPolygon
            .getPath()
            .getArray()
            .map((coord: any, i: number) => ({
              lat: coord.lat(),
              lng: coord.lng(),
              index: i,
            }));

          const newPolygon = {
            points: coords,
            name: ShapeName.polygon,
            code,
            headerId: shape.headerId,
            headerName: shape.headerName,
            fenceType: shape.fenceType,
          };

          this.editedFence = [newPolygon];

          // const shapeIndex = this.fence.findIndex(
          //   (el) => el.code === code
          // );

          // this.fence.splice(shapeIndex, 1, newPolygon);

          console.log(this.editedFence);
        });
      });

      // info window
      const infoWindow = this.gMapLoader.viewGeofenceInfo(
        drawnPolygon,
        this.customHTML(code, drawnPolygon, 0, shape),
        this.GoogleMap,
        this.map
      );
      this.infoWindow.push({ infoWindow, code });

      // this.map.fitBounds(this.drawnPolygon.bindTo());
      const bounds = new this.GoogleMap.LatLngBounds();

      drawnPolygon.getPaths().forEach((path: any) => {
        path.forEach((latlng: any) => {
          bounds.extend(latlng);
          this.map.fitBounds(bounds);
        });
      });
    }

    if (shape.name === ShapeName.circle) {
      console.log(shape.radius);

      const point = <Points[]>shape.points;
      const radius = shape.radius;
      const drawnCircle = new this.GoogleMap.Circle({
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: 0.35,
        center: point[0],
        radius,
        draggable: true,
        editable: true,
      });
      drawnCircle.setMap(this.map);

      this.drawnPolygon.push(drawnCircle);

      // this.fetchGoogleStreet({
      //   lat: point[0]['lat']!,
      //   lng: point[0]['lng']!,
      // });

      //listen to drag event and update the shape data accordingly
      ['radius_changed', 'center_changed', 'dragend'].forEach((eventName) => {
        drawnCircle.addListener(eventName, () => {
          const bounds = drawnCircle;

          const newCircle = {
            points: [
              {
                lat: bounds?.getCenter()?.lat(),
                lng: bounds?.getCenter()?.lng(),
              },
            ],
            radius: bounds.getRadius().toString(),
            name: shape.name,
            code,
            headerId: shape.headerId,
            headerName: shape.headerName,
            fenceType: shape.fenceType,
          };

          const shapeIndex = this.geofencing.findIndex(
            (el) => el.code === code
          );
          this.editedFence = [newCircle];

          // this.geofencing.splice(shapeIndex, 1, newCircle);
        });
      });

      // this.GoogleMap.event.addListener(this.drawnCircle[i], "click", () => {
      //   console.log("click");
      this.infoShapes.push({ shape: drawnCircle, code });

      const infoWindow = this.gMapLoader.viewGeofenceInfo(
        drawnCircle,
        this.customHTML(code, drawnCircle, 0, shape),
        this.GoogleMap,
        this.map
      );
      this.infoWindow.push({ infoWindow, code });

      // });

      // });

      // fit bounds
      // this.map.fitBounds(this.drawnCircle.getBounds());
    }

    // if (shape.name === ShapeName.rect) {
    //   const point = <RectPoints[]>shape.points;

    //   this.drawnRectangle = new this.GoogleMap.Rectangle({
    //     strokeColor: '#0000FF',
    //     strokeOpacity: 0.8,
    //     strokeWeight: 2,
    //     fillColor: '#0000FF',
    //     fillOpacity: 0.35,
    //     draggable: true,
    //     editable: true,
    //     bounds: {
    //       east: point[0]['east'],
    //       north: point[0]['north'],
    //       south: point[0]['south'],
    //       west: point[0]['west'],
    //     },
    //   });
    //   //show on map
    //   this.drawnRectangle.setMap(this.map);

    //   //check uf street view is available
    //   // this.fetchGoogleStreet({
    //   //   lat: point[0]['east']!,
    //   //   lng: point[0]['west']!,
    //   // });
    //   this.infoShapes.push({ shape: this.drawnRectangle, code });

    //   //listen to drag event and update the shape data accordingly
    //   ['bounds_changed', 'dragend'].forEach((eventName) => {
    //     this.drawnRectangle.addListener(eventName, () => {
    //       const bounds = this.drawnRectangle.getBounds()?.toJSON();

    //       const newRect = {
    //         points: [
    //           {
    //             east: bounds?.east,
    //             north: bounds?.north,
    //             south: bounds?.south,
    //             west: bounds?.west,
    //           },
    //         ],
    //         name,
    //         code,
    //       };

    //       const shapeIndex = this.geofencing.findIndex(
    //         (el) => el.code === code
    //       );

    //       // this.geofencing.splice(shapeIndex, 1, newRect);
    //     });
    //   });

    //   //load info window when clicked
    //   const infoWindow = this.gMapLoader.viewGeofenceInfo(
    //     this.drawnRectangle,
    //     this.customHTML(code, this.drawnRectangle, 0, shape),
    //     this.GoogleMap,
    //     this.map
    //   );
    //   this.infoWindow.push({ infoWindow, code });
    //   //zoom in bounds
    //   // const boundRect = new this.GoogleMap.LatLng(
    //   //   this.drawnRectangle.getBounds()
    //   // );
    //   // // this.bounds.extend(boundRect);
    //   // this.map.fitBounds(this.drawnRectangle.getBounds());
    // }
  }

  private addShapesToMap(shapes: Shape[]): void {
    // this.geofencing = shapes;
    // this.geofencing =
    shapes.map(({ code, name, points, radius }, i) => {
      // console.log(name, points[0], "every:", points);

      if (name === ShapeName.rect) {
        const point = <RectPoints[]>points;
        this.drawnRectangle[i] = new this.GoogleMap.Rectangle({
          strokeColor: '#0000FF',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#0000FF',
          fillOpacity: 0.35,
          draggable: true,
          editable: true,
          bounds: {
            east: point[0]['east'],
            north: point[0]['north'],
            south: point[0]['south'],
            west: point[0]['west'],
          },
        });
        //show on map
        this.drawnRectangle[i].setMap(this.map);

        //check uf street view is available
        // this.fetchGoogleStreet({
        //   lat: point[0]['east']!,
        //   lng: point[0]['west']!,
        // });
        this.infoShapes.push({ shape: this.drawnRectangle[i], code });

        //listen to drag event and update the shape data accordingly
        ['bounds_changed', 'dragend'].forEach((eventName) => {
          this.drawnRectangle[i].addListener(eventName, () => {
            const bounds = this.drawnRectangle[i].getBounds()?.toJSON();

            const newRect = {
              points: [
                {
                  east: bounds?.east,
                  north: bounds?.north,
                  south: bounds?.south,
                  west: bounds?.west,
                },
              ],
              name,
              code,
            };

            const shapeIndex = this.geofencing.findIndex(
              (el) => el.code === code
            );

            this.geofencing.splice(shapeIndex, 1, newRect);
          });
        });

        //load info window when clicked
        const infoWindow = this.gMapLoader.viewGeofenceInfo(
          this.drawnRectangle[i],
          this.customHTML(code, this.drawnRectangle[i], i, shapes),
          this.GoogleMap,
          this.map
        );
        this.infoWindow.push({ infoWindow, code });
        //zoom in bounds
        // const boundRect = new this.GoogleMap.LatLng(
        //   this.drawnRectangle.getBounds()
        // );
        // // this.bounds.extend(boundRect);
        // this.map.fitBounds(this.drawnRectangle.getBounds());
      }

      if (name === ShapeName.circle) {
        console.log(radius);

        const point = <Points[]>points;
        this.drawnCircle[i] = new this.GoogleMap.Circle({
          strokeColor: '#0000FF',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#0000FF',
          fillOpacity: 0.35,
          center: point[0],
          radius,
          draggable: true,
          editable: true,
        });
        this.drawnCircle[i].setMap(this.map);

        // this.fetchGoogleStreet({
        //   lat: point[0]['lat']!,
        //   lng: point[0]['lng']!,
        // });

        //listen to drag event and update the shape data accordingly
        ['radius_changed', 'center_changed', 'dragend'].forEach((eventName) => {
          this.drawnCircle[i].addListener(eventName, () => {
            const bounds = this.drawnCircle[i];

            const newCircle = {
              points: [
                {
                  lat: bounds?.getCenter()?.lat(),
                  lng: bounds?.getCenter()?.lng(),
                },
              ],
              radius: bounds.getRadius().toString(),
              name,
              code,
            };

            const shapeIndex = this.geofencing.findIndex(
              (el) => el.code === code
            );

            this.geofencing.splice(shapeIndex, 1, newCircle);
          });
        });

        // this.GoogleMap.event.addListener(this.drawnCircle[i], "click", () => {
        //   console.log("click");
        this.infoShapes.push({ shape: this.drawnCircle[i], code });

        const infoWindow = this.gMapLoader.viewGeofenceInfo(
          this.drawnCircle[i],
          this.customHTML(code, this.drawnCircle[i], i, shapes),
          this.GoogleMap,
          this.map
        );
        this.infoWindow.push({ infoWindow, code });

        // });

        // });

        // fit bounds
        // this.map.fitBounds(this.drawnCircle.getBounds());
      }

      if (name === ShapeName.polygon) {
        const point = <Points[]>points;
        this.drawnPolygon[i] = new this.GoogleMap.Polygon({
          paths: points,
          strokeColor: '#0000FF',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#0000FF',
          fillOpacity: 0.35,
          draggable: true,
          editable: true,
        });
        this.drawnPolygon[i].setMap(this.map);
        // this.fetchGoogleStreet({
        //   lat: point[0]['lat'],
        //   lng: point[0]['lng'],
        // });

        // this.bounds.extend(this.drawnPolygon.getBounds());
        this.infoShapes.push({ shape: this.drawnPolygon[i], code });

        //listen to drag event and update the shape data accordingly
        ['insert_at', 'remove_at', 'set_at', 'dragend'].forEach((eventName) => {
          this.drawnPolygon[i].getPath().addListener(eventName, () => {
            const coords = this.drawnPolygon[i]
              .getPath()
              .getArray()
              .map((coord: any, i: number) => ({
                lat: coord.lat(),
                lng: coord.lng(),
                index: i,
              }));

            const newPolygon = {
              points: coords,
              name: ShapeName.polygon,
              code,
            };

            const shapeIndex = this.geofencing.findIndex(
              (el) => el.code === code
            );

            this.geofencing.splice(shapeIndex, 1, newPolygon);
          });
        });

        // info window
        const infoWindow = this.gMapLoader.viewGeofenceInfo(
          this.drawnPolygon[i],
          this.customHTML(code, this.drawnPolygon[i], i, shapes),
          this.GoogleMap,
          this.map
        );
        this.infoWindow.push({ infoWindow, code });

        // this.map.fitBounds(this.drawnPolygon.bindTo());
        const bounds = new this.GoogleMap.LatLngBounds();

        this.drawnPolygon[i].getPaths().forEach((path: any) => {
          path.forEach((latlng: any) => {
            bounds.extend(latlng);
            this.map.fitBounds(bounds);
          });
        });
      }

      // this.map.fitBounds(this.bounds);
    });
  }

  customHTML(code: string, shape: any, index: number, shapes: any) {
    const container = this.renderer.createElement('div');
    this.renderer.setStyle(container, 'padding-bottom', '0.3rem');
    this.renderer.setStyle(container, 'display', 'flex');
    this.renderer.setStyle(container, 'flexDirection', 'column');
    this.renderer.setStyle(container, 'alignItems', 'center');
    this.renderer.setStyle(container, 'justifyContent', 'center');

    const p1 = this.renderer.createElement('h3');
    const name = this.renderer.createText(`${shapes.headerName}`);
    this.renderer.appendChild(p1, name);

    const button = this.renderer.createElement('ion-button');
    this.renderer.addClass(button, 'operate');
    this.renderer.addClass(button, 'rounded-md');
    this.renderer.addClass(button, 'px-1.5');
    this.renderer.addClass(button, 'py-1');
    this.renderer.addClass(button, 'bg-blue-500');
    this.renderer.addClass(button, 'text-white');
    this.renderer.addClass(button, 'hover:bg-blue-700');
    this.renderer.addClass(button, 'hover:text-white');
    const buttonText = this.renderer.createText('Remove');
    button.size = 'small';
    button.fill = 'outline';

    button.onclick = () => {
      const infoShape = this.infoShapes.filter((el: any) => el.code === code)[0]
        .shape;
      const deleteShape = this.geofencing.filter((el) => el.code === code)[0];
      const deleteInfoWindow = this.infoWindow.findIndex(
        (el) => el.code === code
      );
      infoShape.setMap(null);

      this.infoWindow[deleteInfoWindow].infoWindow.close();
      this.geofencing.splice(index, 1);
    };

    // this.renderer.appendChild(button, buttonText);

    this.renderer.appendChild(container, p1);
    // this.renderer.appendChild(container, button);
    return container;
  }
  private _createSourceObservable(
    subdomain?: string,
    deviceCategName?: string,
    networkId?: string
  ) {
    // this.deviceDirStore.getDeviceCategoryDirectory(subdomain, deviceCategName);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
