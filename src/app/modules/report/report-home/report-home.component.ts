import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovingOverviewComponent } from '../moving-overview/moving-overview.component';
import { MapComponent } from '../../monitor/map/map.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-report-home',
  standalone: true,
  imports: [CommonModule, MovingOverviewComponent, MapComponent, RouterModule],
  templateUrl: './report-home.component.html',
  styleUrls: ['./report-home.component.scss'],
})
export class ReportHomeComponent implements OnInit {
  selectedDeviceId!: string[];

  constructor() {}

  ngOnInit(): void {}

  getDevice(deviceIds: string[]) {
    this.selectedDeviceId = deviceIds;
    // console.log(this.selectedDeviceId);
  }
}
