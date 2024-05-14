import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-geofencing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './geofencing.component.html',
  styleUrls: ['./geofencing.component.scss']
})
export class GeofencingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
