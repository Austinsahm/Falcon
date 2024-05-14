import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DeviceListComponent } from '../device-list/device-list.component';

@Component({
  selector: 'app-device-management-home',
  standalone: true,
  imports: [CommonModule,DeviceListComponent, RouterModule],
  templateUrl: './device-management-home.component.html',
  styleUrls: ['./device-management-home.component.scss']
})
export class DeviceManagementHomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }


}
