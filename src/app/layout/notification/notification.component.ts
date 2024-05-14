import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Data, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ProgressPipe } from 'src/app/widgets/common_widget/progress.pipe';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

export interface alarm {
  deviceName: string;
  alarmType: string;
  alarmTime: Date;
  signalTime: Date;
  speed: number;
  course: string;
  description: string;
  operating: boolean;
}

const ELEMENT_DATA: alarm[] = [
  {
    deviceName: 'MTN Car Tracker',
    alarmType: 'Burglar Alarm',
    alarmTime: new Date('2023-11-27T09:08:22.0'),
    signalTime: new Date('2023-11-27T09:08:22.0'),
    speed: 25,
    course: 'North-East',
    description: 'Moving slow',
    operating: false,
  },
  {
    deviceName: 'GPS Tracker',
    alarmType: 'Speeding Alarm',
    alarmTime: new Date('2023-11-28T12:30:45.0'),
    signalTime: new Date('2023-11-28T12:30:45.0'),
    speed: 60,
    course: 'South',
    description: 'Exceeding speed limit',
    operating: true,
  },
  {
    deviceName: 'Security System',
    alarmType: 'Intrusion Alert',
    alarmTime: new Date('2023-11-29T18:45:10.0'),
    signalTime: new Date('2023-11-29T18:45:10.0'),
    speed: 0,
    course: 'Stationary',
    description: 'Possible intrusion detected',
    operating: true,
  },
  // Add more entries as needed
];

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, RouterModule, ProgressPipe, MatTableModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  notification$!: Observable<any[]>;
  @Input() notifications = [];

  displayedColumns: string[] = [
    'deviceName',
    'alarmType',
    'alarmTime',
    'signalTime',
    'speed',
    'course',
    'description',
    'operating',
  ];
  dataToDisplay = [...ELEMENT_DATA];
  dataSource = new MatTableDataSource<any>(this.dataToDisplay);

  constructor() {}

  ngOnInit(): void {
    this.notification$ = of([]);
  }
}
