import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
  Renderer2,
  OnChanges,
  ElementRef,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DashboardDevice } from 'src/app/models/dashboard.model';
import { MatSort } from '@angular/material/sort';
import { DeviceService } from '../../device-management/device.service';
import { DashboardHttpService } from 'src/app/data-access/http/dashboard-http.service';
import { HttpClient } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { MatNativeDateModule } from '@angular/material/core';
import * as _moment from 'moment';
import { GoogleMap } from 'src/app/widgets/sdk/google-map';
import { DeviceCoordinates, Shape, ShapeName } from 'src/app/models/gps.model';
import { StatusCode } from 'src/app/models/http.model';
import { ToastrService } from 'ngx-toastr';
import { DeviceCategoryFieldComponent } from 'src/app/widgets/device-widget/device-category-field/device-category-field.component';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Observable, Subscription, concatMap, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

// import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
// import {} from "@angular/google-maps";
// import { google } from '@google/maps';
// import { GoogleMapsModule } from '@angular/google-maps'

@Component({
  selector: 'app-moving-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatNativeDateModule,
    DeviceCategoryFieldComponent,
    NgxMatMomentModule,
    MatInputModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    // GoogleMapsModule
  ],
  templateUrl: './moving-overview.component.html',
  styleUrls: ['./moving-overview.component.scss'],
})
export class MovingOverviewComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('map') mapElementRef!: ElementRef;
  user: any;
  map!: any;
  marker!: any;
  GoogleMap!: any;
  animatingPath!: google.maps.Polyline;
  deviceInfo!: any;

  markerIcon!: string;
  geofencing: Shape[] = [];
  geofenceCount = 0;
  enableGeofence = false;
  minSpeed!: number;
  maxSpeed!: number;
  polyline: boolean = false;
  intervalForAnimation!: number;
  count = 0;
  animatingSvgCar!: google.maps.Polyline;
  polyPath: google.maps.Polyline[] = [];
  polyMarkers: google.maps.Marker[] = [];
  loading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Output() selectedDeviceId = new EventEmitter<string[]>();

  today = new Date();
  month = this.today.getMonth();
  year = this.today.getFullYear();
  deviceId = new FormControl('', Validators.required);

  campaignOne = new FormGroup({
    start: new FormControl(new Date(this.year, this.month, 13)),
    end: new FormControl(new Date(this.year, this.month, 16)),
  });

  moment = _moment;

  // dateForm: FormGroup;
  dateForm: FormGroup;

  displayedColumns: string[] = [
    'select',
    'column1',
    'column2',
    'column3',
    'column4',
    'column5',
  ];
  dataSource = new MatTableDataSource<DashboardDevice>();
  devices: DashboardDevice[] = [];
  clickedRows = new Set<DashboardDevice>();
  dashboards$: any = [];
  companyId: string = '';
  selection = new SelectionModel<DashboardDevice>(true, []);
  markerSpeed!: string;
  selectRow = 0;
  deviceIds: string[] = [];
  subscription!: Subscription;
  path: DeviceCoordinates[] = [];
  devices$!: Observable<DashboardDevice[]>;
  control: boolean = false;

  constructor(
    private http: HttpClient,
    private deviceService: DeviceService,
    private readonly fb: FormBuilder,
    private readonly dashboard: DashboardHttpService,
    private mapLoader: GoogleMap,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private userInfo: UserInfoService,
    private readonly cd: ChangeDetectorRef // private gMapLoader: GoogleMapLoader,
  ) {
    this.today = new Date();

    this.dateForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      deviceId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.subscription = this.userInfo
      .getUser()
      .pipe(
        concatMap((user) => {
          if (user) this.companyId = user.userCompanyId;
          return this.deviceService.getData(user?.userCompanyId).pipe(
            map((devices) => {
              if (devices.length) {
                this.devices = devices;
                this.dataSource.data = devices;
                this.dataSource.paginator = this.paginator;
              } else {
                this.toastr.error('Devices Unavaliable', '');
              }
            })
          );
        })
      )
      .subscribe();
    0;
  }

  ngAfterViewInit(): void {
    this.mapLoader.loadGoogleMap().then((googleMap) => {
      this.GoogleMap = googleMap;
      const controls = {
        zoom: 5,
        streetViewControl: false,
        // center: { lat: -3.437, lng: 24.43359 },
        center: { lat: 6.5244, lng: 3.3792 },
        mapTypeId: googleMap.MapTypeId.ROADMAP,
      };

      const mapElement = this.mapElementRef.nativeElement;

      this.map = new googleMap.Map(mapElement, controls);

      googleMap.event.addListenerOnce(this.map, 'idle', () => {
        this.renderer.addClass(mapElement, 'visible');

        // this.multiColorPolyline([]);
      });
    });
  }

  fetchId(devices: any) {
    if (!this.loading) {
      this.showNotificationWhileLoadingData();
    }
    let startDate = this.dateForm
      .get('startDate')!
      .value.format('YYYY-MM-DD HH:mm:ss');
    let endDate = this.dateForm
      .get('endDate')!
      .value.format('YYYY-MM-DD HH:mm:ss');

    this.control = true;

    const deviceId = this.dateForm.value.deviceId;

    devices.deviceId;
    this.selectedDeviceId.emit(devices.deviceId);
    // this.path = [];

    this.deviceService
      .getData(this.companyId)
      .pipe(
        map((devices) => {
          return devices.filter((device) => {
            return device.deviceId === deviceId;
          });
        })
      )
      .subscribe((filteredDevices: DashboardDevice[]) => {
        const device = filteredDevices;
        this.minSpeed = device[0].minSpeed;
        this.maxSpeed = device[0].maxSpeed;
        // console.log(filteredDevices);
      });

    this.dashboard.geofenceTracing(deviceId, startDate, endDate).subscribe(
      (data) => {
        // this.animatingSvgCar =  new this.GoogleMap.Polyline()
        this.count = 0;
        // this.markerSpeed = "200"
        this.intervalForAnimation = 0;
        if (this.animatingPath) this.animatingPath.setMap(null);
        if (this.animatingSvgCar) this.animatingSvgCar.setMap(null);
        if (this.polyPath.length) {
          this.polyPath.map((path) => {
            path.setMap(null);
          });
        }
        if (this.polyMarkers.length) {
          this.polyMarkers.map((marker) => {
            marker.setMap(null);
          });
        }

        // const dat = [
        //   {
        //     lng: 3.8810354902675783,
        //     lat: 7.391831146028238,
        //     time: '2022-12-10 13:07:57.0',
        //     seqNumber: 7896,
        //     speed: 'no-speed',
        //   },
        //   {
        //     lng: 3.896475747814918,
        //     lat: 7.401547672194951,
        //     time: '2022-12-10 13:08:57.0',
        //     seqNumber: 7897,
        //     speed: 'normal',
        //   },
        //   {
        //     lng: 3.922161845173491,
        //     lat: 7.4208708898549105,
        //     time: '2022-12-10 13:09:57.0',
        //     seqNumber: 7898,
        //     speed: 'over-speed',
        //   },
        //   {
        //     lng: 3.936333485096469,
        //     lat: 7.427897304135712,
        //     time: '2022-12-10 13:09:57.0',
        //     seqNumber: 7899,
        //     speed: 'no-speed',
        //   },
        // ];

        // this.animatingMarker(data);
        this.multiColorPolyline(data);

        // this.useDirectionService(dat);
      },
      (error) => {
        if (!error.status) this.toastr.error(error);
        else this.toastr.error('Unknown errors', '');
      }
    );
    if (this.loading) {
      this.hideNotificationAfterLoading();
    }
  }

  out(companyId: string) {
    // console.log(companyId, 'COmap');

    this.deviceService.getData(companyId).subscribe((res) => {
      this.devices = res;
      this.dataSource.data = res;
      this.dataSource.paginator = this.paginator;
      // this.dataSource.filter = filtervalue.trim().toLowerCase();
      // this.dataSource.sort = this.sort;
      // console.log(res);
    });
  }

  applyFilter(filtervalue: string) {
    this.dataSource.filter = filtervalue.trim().toLowerCase();
  }

  // Function to show a notification while loading data
  private showNotificationWhileLoadingData() {
    this.loading = true;
    this.toastr.info('Loading data...', 'Please wait', {
      timeOut: 0, // Set timeOut to 0 to make it a sticky notification
      progressBar: true,
    });
  }

  // Function to hide the notification when loading is done
  private hideNotificationAfterLoading() {
    this.loading = false;
    this.toastr.clear();
  }

  toggleChecked(row: DashboardDevice) {
    if (this.selectedRow()) {
      // const deviceIds =
      this.dataSource.data
        .filter((el) => el.deviceId === row.deviceId)
        .forEach((el) => this.deviceIds.push(el.deviceId));

      this.selectedDeviceId.emit(this.deviceIds);
    } else {
      const uncheckDevice = this.deviceIds.findIndex(
        (el) => el === row.deviceId
      );

      this.deviceIds.splice(uncheckDevice, 1);

      this.selectedDeviceId.emit(this.deviceIds);
      // this.selection.clear();
      return;
    }
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  selectedRow(): boolean {
    const numSelected = this.selection.selected.length;
    console.log(numSelected, this.selectRow, this.deviceIds);
    this.showGeofencingTools();

    if (numSelected > this.selectRow) {
      this.selectRow = this.selectRow + 1;
      return true;
    }
    this.selectRow = this.selectRow - 1;
    return false;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectedDeviceId.emit([]);
      return;
    }
    this.selectRow = this.selection.select.length;
    this.dataSource.data
      .map((el) => el.deviceId)
      .forEach((el) => {
        this.deviceIds.push(el);
        this.selectRow = this.selectRow + 1;
      });
    this.selection.select(...this.dataSource.data);

    this.selectedDeviceId.emit(this.deviceIds);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DashboardDevice): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    // const deviceIds = []
    // deviceIds.push(row.deviceId)
    // console.log(deviceIds);

    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.deviceId + 1
    }`;
  }

  animatingMarker(data: DeviceCoordinates[], icon?: string): void {
    // this.updatePolylineAnimation(this.animatingPath);

    const lineSymbol = {
      path: 'M75.29,11.08c-3.08-3.34-11.75-3.14-11.75-3.14,0,0-39.16,.47-44.65,.57-4.3,.07-10.82,.64-14.15,1.19-1.3,.22-2.12,.8-2.62,1.84C-.07,15.9,0,23.97,0,23.97,0,23.97-.07,32.03,2.09,36.41c.51,1.02,1.32,1.62,2.62,1.84,3.35,.55,9.85,1.11,14.15,1.19,5.49,.09,44.65,.57,44.65,.57,0,0,8.68,.18,11.75-3.15,1.03-1.11,2.75-3.54,3.04-6.82v-12.11c-.27-3.28-2.01-5.72-3.02-6.84Zm4.8-4.65c-3.11-3.34-11.88-3.15-11.88-3.15,0,0-39.56,.47-45.11,.57-4.36,.07-10.93,.64-14.3,1.19-1.32,.22-2.14,.8-2.65,1.84-2.18,4.38-2.11,12.43-2.11,12.43,0,0-.07,8.06,2.11,12.43,.51,1.02,1.34,1.62,2.65,1.84,3.39,.55,9.94,1.11,14.3,1.19,5.55,.09,45.11,.57,45.11,.57,0,0,8.77,.18,11.88-3.15,1.03-1.11,2.78-3.54,3.06-6.82V13.25c-.27-3.28-2.03-5.71-3.06-6.82ZM27.3,3.79c-1.96,.02-3.42,.05-4.21,.05-4.36,.07-10.93,.64-14.3,1.19-1.32,.22-2.14,.8-2.65,1.84-2.18,4.38-2.11,12.43-2.11,12.43,0,0-.07,8.06,2.11,12.43,.51,1.02,1.34,1.62,2.65,1.84,3.39,.55,9.94,1.11,14.3,1.19,.77,.02,2.22,.04,4.12,.05l-6.61-6.58V10.46l6.7-6.67ZM8.86,31.7c-2.18-4.36-2.11-12.4-2.11-12.4,0,0-.07-8.04,2.11-12.4,.35-.69,.86-1.19,1.56-1.49-.62,.07-1.17,.15-1.63,.22-1.32,.2-2.14,.78-2.65,1.75-2.18,4.19-2.11,11.92-2.11,11.92,0,0-.07,7.73,2.11,11.92,.51,.98,1.34,1.55,2.65,1.75,.46,.07,1.01,.15,1.63,.22-.7-.31-1.21-.78-1.56-1.49ZM60.97,5.05h-19.81c-1.9,0-3.81,.07-5.69,.24l-11.7,.95c-.29,.02-.59,.11-.84,.27-.4,.26-.35,.88,.51,1.19,1.96,.67,14.12,1.57,23.18,.38,6.41-.84,11.77-1.99,14.39-2.61,.26-.07,.22-.42-.04-.42ZM5.42,11.27s.79-3.97,2.25-5c1.46-1.02,5.49-1.08,5.49-1.08l-.38,1.19s-3.52,.02-4.76,.91c-1.12,.8-2.2,3.63-2.2,3.63l-.4,.35ZM80.08,6.44c-3.11-3.34-11.88-3.15-11.88-3.15,0,0-.77,.02-2.11,.02l-1.89,1.99c9.8,1.26,16.15,4.34,17.5,5.58,1.17,1.08,1.17,15.79,0,16.88-1.35,1.24-7.71,4.32-17.5,5.58l1.89,1.99c1.34,.02,2.11,.02,2.11,.02,0,0,8.77,.18,11.88-3.15,1.03-1.11,2.78-3.54,3.06-6.82V13.25c-.27-3.28-2.03-5.71-3.06-6.82Zm-56.13,2.77c-6.44-.67-8.53-1.15-8.53-1.15-1.43,4.78-1.24,11.25-1.24,11.25,0,0-.18,6.49,1.24,11.25,0,0,2.16-.46,8.53-1.15,0,0-.77-5.16-.77-10.12s.77-10.08,.77-10.08Zm43.1-1.15c-1.06-2.48-4.3-1.71-4.3-1.71l-11.41,2.39,.31,4.39c.29,4.14,.29,8.28,0,12.4l-.31,4.39,11.41,2.39s3.26,.77,4.3-1.71c0,0,2.58-4.87,2.58-11.25s-2.58-11.29-2.58-11.29Zm-6.08,25.51h-19.81c-1.9,0-3.81-.07-5.69-.24l-11.7-.95c-.29-.02-.59-.11-.84-.27-.4-.26-.35-.88,.51-1.18,1.96-.67,14.12-1.57,23.18-.38,6.41,.84,11.77,1.99,14.39,2.61,.26,.07,.22,.42-.04,.42ZM5.42,27.35s.79,3.97,2.25,5c1.46,1.02,5.49,1.08,5.49,1.08l-.38-1.19s-3.52-.02-4.76-.91c-1.12-.8-2.2-3.63-2.2-3.63l-.4-.35ZM83.84,14.49c-.05-1.19-.46-2.3-1.12-3.1l-.05-.07c.51,3.81,.51,12.18,0,15.99l.05-.07c.66-.8,1.04-1.91,1.12-3.1,.07-1.49,.16-3.54,.16-4.81s-.09-3.35-.16-4.83Zm-4.34,16.94c-1.04,1.04-2.22,1.73-3.72,1.97-1.45,.18-2.45-.55-2.56-1-.31-1.15,.31-.89,2.87-1.84,2.6-.97,4.03-1.68,5.38-2.59-.7,1.66-1.19,2.68-1.98,3.46Zm0-24.23c-1.04-1.04-2.22-1.73-3.72-1.97-1.45-.18-2.45,.55-2.56,1-.31,1.15,.31,.89,2.87,1.84,2.6,.97,4.03,1.68,5.38,2.59-.7-1.68-1.19-2.68-1.98-3.46Zm0,24.23c-1.04,1.04-2.22,1.73-3.72,1.97-1.45,.18-2.45-.55-2.56-1-.31-1.15,.31-.89,2.87-1.84,2.6-.97,4.03-1.68,5.38-2.59-.7,1.66-1.19,2.68-1.98,3.46ZM58.17,4.05s1.68,.24,1.63-.84c-.02-1.06-2.07-3.21-3.26-3.21s-.88,.57-.88,.57c0,0,1.35,3.1,1.83,3.34s.68,.15,.68,.15Zm.22-.11c-.42-.22-1.24-1.99-1.72-3.03-.31-.66-1.01-.36-1.01-.36,0,0,1.35,3.1,1.83,3.34,.48,.24,.68,.16,.68,.16,0,0,.24,.04,.55,.02-.09-.02-.2-.07-.33-.13Zm-.22,30.63s1.68-.24,1.63,.84c-.04,1.08-2.07,3.23-3.28,3.23s-.88-.57-.88-.57c0,0,1.35-3.1,1.83-3.34,.49-.24,.7-.16,.7-.16Zm.22,.13c-.42,.22-1.24,1.99-1.72,3.03-.31,.66-1.01,.36-1.01,.36,0,0,1.35-3.1,1.83-3.34s.68-.16,.68-.16c0,0,.24-.04,.55-.02-.09,.02-.2,.05-.33,.13Z',
      scale: 1,
      strokeColor: '#313131',
      fillColor: '#f3f3f3',
      fillOpacity: 1,
      rotation: -90,
      anchor: new this.GoogleMap.Point(24, 24),
    };

    const animatingPath = new this.GoogleMap.Polyline({
      path: data,
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 5,
      map: this.map,
      icons: [{ icon: lineSymbol, offset: '100%' }],
    });

    // this.animatingSvg(animatingPath);

    const bounds = new this.GoogleMap.LatLngBounds();
    for (let i = 0; i < animatingPath.getPath().getLength(); i++) {
      bounds.extend(animatingPath.getPath().getAt(i));
    }

    this.map.fitBounds(bounds);
    this.deviceTimeStamp(animatingPath, data);
    // console.log(lineSymbol, animatingPath);
  }

  private deviceTimeStamp(path: any, coordinates: DeviceCoordinates[]): void {
    this.deviceInfo = new this.GoogleMap.InfoWindow();

    this.GoogleMap.event.addListener(path, 'mouseover', (evt: any) => {
      let minDist = Number.MAX_VALUE;
      let index: number = 0;
      for (let i = 0; i < path.getPath().getLength(); i++) {
        const distance =
          this.GoogleMap.geometry.spherical.computeDistanceBetween(
            evt.latLng,
            path.getPath().getAt(i)
          );
        if (distance < minDist) {
          minDist = distance;
          index = i;
        }
      }

      const formatted_data = `<div style="color:black">Time: ${coordinates[index].time}</div><div style="color:black">Speed: ${coordinates[index].speed} km/h</div>`;

      // this.fetchGoogleStreet({
      //   lat: coordinates[index].lat,
      //   lng: coordinates[index].lng,
      // });

      this.deviceInfo.setContent(formatted_data);
      this.deviceInfo.setPosition(path.getPath().getAt(index));
      this.deviceInfo.open(this.map);
    });
  }

  animatingSvg() {
    this.intervalForAnimation = window.setInterval(
      () => {
        this.count = (this.count + 1) % 200;

        let icons = this.animatingSvgCar.get('icons');
        icons[0].offset = this.count / 2 + '%';

        this.animatingSvgCar.set('icons', icons);

        if (this.count === 199) {
          window.clearInterval(this.intervalForAnimation);
        }
      },

      this.markerSpeed ? +this.markerSpeed : 200
    );
  }

  pause() {
    window.clearInterval(this.intervalForAnimation);
  }

  restart() {
    this.count = 0;
  }

  viewGeofence() {
    console.log('geofence');
  }

  geofenceCode(): string {
    this.geofenceCount = this.geofenceCount + 1;
    if (this.geofenceCount >= 1) {
      this.enableGeofence = true;
      this.cd.markForCheck();
    }
    let code = prompt('Please, enter the geofencing code') || '';
    return code;
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
        let code = this.geofenceCode();
        if (!code) {
          return event.overlay.setMap(null);
        }
        code = code.replace(/\s+/g, '').toUpperCase();

        let len = code.length;

        let sameCode = this.geofencing.findIndex((g) => g.code === code);

        while (len === 0 || sameCode !== -1) {
          let code = this.geofenceCode();
          sameCode = this.geofencing.findIndex(
            (g) => g.code.toUpperCase() === code
          );
          len = code.length;
        }
        this.shapeOverlay(event, code);
        drawingManager.setDrawingMode(null);
      }
    );
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
      this.geofencing.push(circle);
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
        code: 'poly',
      };
      this.geofencing.push(polygon);
    }

    if (event.type === 'rectangle') {
      const bounds = event.overlay.getBounds();
      const north = bounds.getNorthEast().lat();
      const south = bounds.getSouthWest().lat();
      const east = bounds.getNorthEast().lng();
      const west = bounds.getSouthWest().lng();

      const rect = {
        points: [{ east, north, south, west }],
        name: ShapeName.rect,
        code,
      };
      this.geofencing.push(rect);
    }

    // this.GoogleMap.event.removeListener(event)
  }

  private multiColorPolyline(data: DeviceCoordinates[]) {
    const carSymbol = {
      path: 'M32.8.33a23.76,23.76,0,0,0-14.7,6.8c-4.5,4.3-5.4,7-6.1,17.4-.4,6.6.1,19.7.9,23,.4,1.7.4,1.8-1,2.7A24.46,24.46,0,0,1,7.3,52C3.6,53.13,0,56.13,0,58a2.53,2.53,0,0,0,2.8,2.8,63.79,63.79,0,0,0,9.6-2.2c1-.3,1.1-.2.8.8-.6,2-1.2,31.9-1.1,50.1.1,16.7.2,18.3,1.2,21.9a28,28,0,0,1,1,6.2c0,6.6,1.8,13.1,4,15.4,3.2,3.2,12.7,4.9,27.4,4.9,10.8,0,17.6-.8,23-2.6s7.1-4.7,8-13.7c.2-2.7,1-7.7,1.6-11.1,1.1-6.1,1.1-6.8,1.1-27,0-21.7-.6-42.8-1.2-44.3-.3-.8-.2-.8.8-.6,8.4,2.4,10.9,2.7,11.8,1.4,1.9-2.7-1.2-6.3-7.1-8.3-5.5-1.8-5.4-1.6-4.7-6.8.7-5.4.7-21.6,0-26.5S76.8,10.33,73.5,7A26.58,26.58,0,0,0,61.7.53C58.6,0,37.2-.27,32.8.33Zm-3.2,4.4c0,2-3.4,5.6-9.9,10.5-4.2,3.1-4.9,2.7-2.6-1.4,1.6-2.8,6.5-7.3,9.3-8.8C28.8,3.73,29.6,3.63,29.6,4.73Zm36.4.8a26.64,26.64,0,0,1,8.4,8.3c2.4,4.3,1.7,4.6-3,1-6.6-4.9-9.5-8.2-9.5-10.4C61.9,3.53,63.4,3.93,66,5.53Zm-7,29.3c6.2,1.8,11.1,4.9,12.8,7.9.8,1.5.8,1.8-1.1,15-1.2,8.6-2.1,13.6-2.5,14-.6.6-1.5.5-6.6-.2a109,109,0,0,0-15.9-.9,96.38,96.38,0,0,0-15.9.9c-5,.7-6,.7-6.6.2-.4-.4-1.3-5.6-2.5-14.2l-1.9-13.6,1.2-1.7c2.4-3.5,7.9-6.5,14.5-7.9C40.3,33.13,54.1,33.43,59,34.83Zm-24.6,82.8a200.4,200.4,0,0,0,29.7-.6c7.3-.7,7.3-.8,6.9,4.9-.4,4.9-1.7,10.7-2.7,12.4-1.5,2.3-9.7,3.7-22,3.7-12.6,0-21.3-1.4-22.8-3.6-1.8-2.8-3.6-14.5-2.6-16.8.6-1.2.6-1.2,4.1-.9C26.8,117,31.1,117.33,34.4,117.63Z',
      scale: 0.25,
      strokeColor: '#000000',
      fillColor: '#000000',
      fillOpacity: 1,
      strokeWeight: 1,
      rotation: 0,
      anchor: new this.GoogleMap.Point(45, 0),
    };

    // const path = [
    //   {
    //     lat: 7.426311098849161,
    //     lng: 3.911637201059786,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128050,
    //     status: {
    //       stopped: true,
    //       time: '01:37:14',
    //       speed: 20,
    //     },
    //   },
    // ];

    // this.path = [
    //   {
    //     lat: 7.426311098849161,
    //     lng: 3.911637201059786,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128050,
    //     status: {
    //       stopped: true,
    //       time: '01:37:14',
    //       speed: 20,
    //     },
    //   },

    //   {
    //     lat: 7.4273140836779366,
    //     lng: 3.910128050522057,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128051,
    //     status: {
    //       stopped: true,
    //       time: '05:37:14',
    //       speed: 50,
    //     },
    //   },
    //   {
    //     lat: 7.428326680171675,
    //     lng: 3.9108249519440843,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128052,
    //     status: {
    //       stopped: false,
    //       time: null,
    //       speed: 20,
    //     },
    //   },
    //   {
    //     lat: 7.4283774588151426,
    //     lng: 3.9107633121815817,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128053,
    //     status: {
    //       stopped: false,
    //       time: null,
    //       speed: 90,
    //     },
    //   },
    //   {
    //     lat: 7.426820509456966,
    //     lng: 3.9097259782170366,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128054,
    //     status: {
    //       stopped: false,
    //       time: null,
    //       speed: 20,
    //     },
    //   },
    //   {
    //     lat: 7.42677725342264,
    //     lng: 3.9097999459320403,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128055,
    //     status: {
    //       stopped: false,
    //       time: null,
    //       speed: 66,
    //     },
    //   },
    //   {
    //     lat: 7.4273152895640875,
    //     lng: 3.910138852136623,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128056,
    //     status: {
    //       stopped: false,
    //       time: null,
    //       speed: 20,
    //     },
    //   },
    //   {
    //     lat: 7.42616631186541,
    //     lng: 3.9117825258171366,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128057,
    //     status: {
    //       stopped: false,
    //       time: null,
    //       speed: 20,
    //     },
    //   },
    //   {
    //     lat: 7.426335203496463,
    //     lng: 3.9119025546638464,
    //     time: '2023-04-12 00:00:00.0',
    //     seqNumber: 128058,
    //     status: {
    //       stopped: true,
    //       time: '02:37:14',
    //       speed: 20,
    //     },
    //   },
    // ];

    this.path = data;
    // console.log(this.path);

    this.polyline = true;

    const bounds = new this.GoogleMap.LatLngBounds();
    const lineSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      // path: 'M264.07,0C118.23,0,0,118.23,0,264.07S118.23,528.15,264.07,528.15,528.15,409.92,528.15,264.07,409.92,0,264.07,0Zm95.55,246.26L278.75,165.4V418.1H249.87V165.4l-81.34,81.35-20.22-20.7,116-116L379.83,225.57Z',
      strokeOpacity: 1,
      strokeColor: '#000000',
      fillColor: 'white',
      fillOpacity: 1,
      scale: 3,
    };

    const infowindow = new google.maps.InfoWindow();

    if (this.path.length > 1) {
      for (let i = 0; i < this.path.length - 1; i++) {
        // console.log(`Processing index ${i}:`, this.path[i]);

        const poly1 = new this.GoogleMap.LatLng(
          this.path[i].lat,
          this.path[i].lng
        );
        const poly2 = new this.GoogleMap.LatLng(
          this.path[i + 1].lat,
          this.path[i + 1].lng
        );

        const newPath = [];
        newPath.push(poly1);
        newPath.push(poly2);

        this.animatingPath = new this.GoogleMap.Polyline({
          path: newPath,
          strokeOpacity: 1.0,
          strokeWeight: 7,
          map: this.map,
          geodesic: true,
          icons: [{ icon: lineSymbol, offset: '50%' }],
        });

        this.polyPath.push(this.animatingPath);

        // console.log('New Path', newPath, this.animatingPath);

        // this.animatingSvg(this.animatingPath);

        const speed = this.path[i].speed;
        let strokeColor = '#7991E3';

        if (speed > this.minSpeed && speed <= this.maxSpeed) {
          strokeColor = '#63d668';
        } else if (speed > this.maxSpeed) {
          strokeColor = '#f23c32';
        }

        this.animatingPath.setOptions({ strokeColor });

        if (this.path[i].status.stopped === true) {
          const marker1 = new this.GoogleMap.Marker({
            position: poly1,
            map: this.map,
            icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png',
          });

          this.polyMarkers.push(marker1);

          marker1.addListener('click', () => {
            infowindow.setContent(this.path[i].status.time);
            infowindow.open(this.map, marker1);
          });
        }

        if (this.path[i + 1].status.stopped === true) {
          const marker2 = new this.GoogleMap.Marker({
            position: poly2,
            map: this.map,
            icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png',
          });

          this.polyMarkers.push(marker2);

          marker2.addListener('click', () => {
            infowindow.setContent(this.path[i + 1].status.time);
            infowindow.open(this.map, marker2);
          });
        }

        bounds.extend(poly1);
        bounds.extend(poly2);
      }

      this.map.fitBounds(bounds);
    } else if ((this.path.length = 0)) {
      // console.log(this.path, 'Yes');
      const poly1 = new this.GoogleMap.LatLng(
        this.path[0].lat,
        this.path[0].lng
      );
      this.animatingPath = new this.GoogleMap.Polyline({
        path: this.path[0],
        strokeOpacity: 1.0,
        strokeWeight: 7,
        map: this.map,
        geodesic: true,
        icons: [{ icon: lineSymbol, offset: '50%' }],
      });

      this.polyPath.push(this.animatingPath);

      const marker1 = new this.GoogleMap.Marker({
        position: poly1,
        map: this.map,
        icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png',
      });

      this.polyMarkers.push(marker1);

      marker1.addListener('click', () => {
        infowindow.setContent(this.path[0].status.time);
        infowindow.open(this.map, marker1);
      });

      bounds.extend(poly1);
      this.map.fitBounds(bounds);
    } else {
      this.toastr.error('No Path Avaliable', '');
      // alert('No');
    }

    // console.log(this.path);

    this.animatingSvgCar = new this.GoogleMap.Polyline({
      path: this.path,
      strokeWeight: 1,
      strokeOpacity: 0.2,
      map: this.map,
      geodesic: true,
      icons: [{ icon: carSymbol, offset: '100%' }],
    });
    this.animatingSvg();

    this.deviceTimeStamp(this.animatingSvgCar, data);
  }

  private useDirectionService(data: DeviceCoordinates[]) {
    // http://jsfiddle.net/geocodezip/13ejecxj/364/
    const directionService = new this.GoogleMap.DirectionsService();
    const directionDisplay = new this.GoogleMap.DirectionsRenderer({
      suppressPolylines: true,
    });

    directionService.route(
      {
        origin: { lat: data[0].lat, lng: data[0].lng },
        destination: {
          lat: data[3].lat,
          lng: data[3].lng,
        },
        travelMode: this.GoogleMap.TravelMode.DRIVING,
      },
      (res: any, status: any) => {
        // console.log(res, status);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  googleDirectionService() {
    const directionService = new this.GoogleMap.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(this.map);

    const start = new this.GoogleMap.LatLng(7.3867502, 3.8806777);
    const end = new this.GoogleMap.LatLng(7.3867502, 3.8806777);

    const directionServiceData = {
      origin: start,
      destination: end,
      travelMode: 'DRIVING',
      // provideRouteAlternatives: false,
      waypoints: [
        {
          location: new this.GoogleMap.LatLng(7.4206928, 3.861192),
          stopover: false,
        },
      ],
    };

    // const getDirection = await
    directionService.route(directionServiceData, (result: any, status: any) => {
      if (status == 'OK') {
        console.log(result);
        
        directionsRenderer.setDirections(result);
      }
    });
  }

}
