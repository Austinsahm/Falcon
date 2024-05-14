import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageLayoutComponent } from '../layout/page-layout/page-layout.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FooterComponent } from '../layout/footer/footer.component';
import { HeaderComponent } from '../layout/header/header.component';
import { UserInfoService } from '../services/user-info.service';
import { Observable } from 'rxjs';
import { UserSessionInformation } from '../models/user.interface';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    PageLayoutComponent,
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
    FooterComponent,
    HeaderComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  sidenavWidth = 4;
  close!: boolean;
  closeAlarm!: boolean;
  closeDev!: boolean;
  closeReport!: boolean;
  closeUtil!: boolean;
  closeSet!: boolean;
  user$!: Observable<UserSessionInformation | null>;

  events: string[] = [];
  opened!: boolean;

  // shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);

  constructor(
    private router: Router,
    private userInfoService: UserInfoService
  ) {}

  ngOnInit(): void {
    this.user$ = this.userInfoService.getUser();
    // this.sidenavWidth = 20;
  }

  isReportLinkActive(): boolean {
    return this.router.url.includes('/report');
  }

  isAlarmsActive(): boolean {
    return this.router.url.includes('/alarm');
  }

  reloadComponent() {
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }

  reloadCurrentPage() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  increase() {
    this.sidenavWidth = 20;
    this.opened = true;
  }

  decrease() {
    this.closeAlarm = false;
    this.close = false;
    this.closeDev = false;
    this.closeReport = false;
    this.closeUtil = false;
    this.closeSet = false;
    this.sidenavWidth = 4;
  }

  logOut() {
    this.userInfoService
      .deleteUser()
      .subscribe(() => this.router.navigate(['/login']));
    // console.log('Logout');
  }
}
