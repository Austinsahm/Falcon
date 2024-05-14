import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './auth/login-page/login-page.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NotFoundPageComponent } from './layout/not-found-page/not-found-page.component';
import { AddDeviceComponent } from './modules/device-management/add-device/add-device.component';
import { DeviceDetailsComponent } from './modules/device-management/device-details/device-details.component';
import { DeviceListComponent } from './modules/device-management/device-list/device-list.component';
import { DeviceManagementHomeComponent } from './modules/device-management/device-management-home/device-management-home.component';
import { MonitorHomeComponent } from './modules/monitor/monitor-home/monitor-home.component';
import { ReportHomeComponent } from './modules/report/report-home/report-home.component';
import { HomeGuard } from './guard/home.guard';
import { LoginGuard } from './guard/login.guard';
import { DeviceReportListComponent } from './modules/report/device-report-list/device-report-list.component';
import { MovingOverviewComponent } from './modules/report/moving-overview/moving-overview.component';
import { AlarmReportComponent } from './modules/alarm/alarm-report/alarm-report.component';
import { AlarmsComponent } from './modules/alarm/alarms/alarms.component';

const routes: Routes = [
  { path: '', redirectTo: 'monitor', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [LoginGuard],
    component: LoginPageComponent,
  },
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [HomeGuard],
    canLoad: [HomeGuard],
    children: [
      { path: '', redirectTo: 'monitor', pathMatch: 'full' },

      {
        path: 'monitor',
        component: MonitorHomeComponent,
      },
      {
        path: 'device-management',
        component: DeviceManagementHomeComponent,
        children: [
          { path: '', redirectTo: 'device-list', pathMatch: 'full' },
          {
            path: 'device-list',
            component: DeviceListComponent,
          },
          {
            path: 'add-device',
            component: AddDeviceComponent,
          },
          {
            path: 'device-details/:device-id',
            component: DeviceDetailsComponent,
          },
        ],
      },
      {
        path: 'report',
        component: ReportHomeComponent,
        children: [
          { path: '', redirectTo: 'travel-report', pathMatch: 'full' },
          {
            path: 'travel-report',
            component: MovingOverviewComponent,
          },
          {
            path: 'travel-report-list',
            component: DeviceReportListComponent,
          },
        ],
      },
      {
        path: 'alarm',
        component: ReportHomeComponent,
        children: [
          { path: '', redirectTo: 'alarms', pathMatch: 'full' },
          {
            path: 'alarms',
            component: AlarmsComponent,
          },
          {
            path: 'alarm-statistics',
            component: AlarmReportComponent,
          },
        ],
      },
    ],
  },

  {
    path: '**',
    component: NotFoundPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
