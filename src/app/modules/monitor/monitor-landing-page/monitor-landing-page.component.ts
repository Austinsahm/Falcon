import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FooterComponent } from 'src/app/layout/footer/footer.component';
import { HeaderComponent } from 'src/app/layout/header/header.component';
import { PageLayoutComponent } from 'src/app/layout/page-layout/page-layout.component';

@Component({
  selector: 'app-monitor-landing-page',
  standalone: true,
  imports: [CommonModule,
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
    PageLayoutComponent
  ],
  templateUrl: './monitor-landing-page.component.html',
  styleUrls: ['./monitor-landing-page.component.scss']
})
export class MonitorLandingPageComponent implements OnInit {
  sidenavWidth = 4;
  close!: boolean;
  closeDev!: boolean;
  closeReport!: boolean;
  closeUtil!: boolean;
  closeSet!: boolean;

  events: string[] = [];
  opened!: boolean;



  constructor(private router: Router) { }

  ngOnInit(): void {
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
  }

  decrease() {
    this.close = false;
    this.closeDev = false;
    this.closeReport = false;
    this.closeUtil = false;
    this.closeSet = false;
    this.sidenavWidth = 4;
  }
}
