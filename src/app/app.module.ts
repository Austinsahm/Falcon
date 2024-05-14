import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from './auth/auth.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AddDeviceComponent } from './modules/device-management/add-device/add-device.component';
import { HttpClientModule } from '@angular/common/http';
import { DeviceListComponent } from './modules/device-management/device-list/device-list.component';
import { HeaderComponent } from './layout/header/header.component';
import { PageLayoutComponent } from './layout/page-layout/page-layout.component';
import { NotFoundPageComponent } from './layout/not-found-page/not-found-page.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [AppComponent, ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AuthModule,
    MatFormFieldModule,
    AddDeviceComponent,
    DeviceListComponent,
    HttpClientModule,
    HeaderComponent,
    PageLayoutComponent,
    NotFoundPageComponent,
    LandingPageComponent,
    DeviceListComponent,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatCardModule,
    MatMenuModule,
    MatTabsModule,
    MatButtonModule,
    MatFormFieldModule,
    RouterModule,
    MatCheckboxModule,
    ToastrModule.forRoot({
      // positionClass: "toast-center-left",
      preventDuplicates: true,
      timeOut: 5000,
      easing:'bounce',
      easeTime: 200,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
