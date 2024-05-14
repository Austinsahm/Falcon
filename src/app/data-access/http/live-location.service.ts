import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs'; // Import Message from stompjs
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';

type Command =
  | 'device-status'
  | 'set-authority'
  | 'live-location'
  | 'set-fence'
  | 'upload-time'
  | 'cut-off'
  | 'speed-limit';

@Injectable({
  providedIn: 'root',
})
export class LiveLocationService {
  private trackerSubjects: { [deviceId: string]: BehaviorSubject<any> } = {};
  private sendCommand$: { [deviceId: string]: BehaviorSubject<any> } = {};
  private sendAuthorityCommand$: { [deviceId: string]: BehaviorSubject<any> } =
    {};
  private setFence$: { [deviceId: string]: BehaviorSubject<any> } = {};
  private clientObj: { [deviceId: string]: Client } = {};
  private websocketStatus$: { [deviceId: string]: BehaviorSubject<any> } = {};
  private alarmSubjects$: { [deviceId: string]: BehaviorSubject<any> } = {};
  private setUploadTime$: { [deviceId: string]: BehaviorSubject<any> } = {};
  private cutOff$: { [deviceId: string]: BehaviorSubject<any> } = {};
  private speedLimit$: { [deviceId: string]: BehaviorSubject<any> } = {};

  constructor() {}

  liveLocation(deviceId: string) {
    if (!this.trackerSubjects[deviceId]) {
      this.trackerSubjects[deviceId] = new BehaviorSubject<any>({});
    }
    return this.trackerSubjects[deviceId].asObservable();
  }

  sendCommand(command: any): Observable<any> {
    if (!this.sendCommand$[command.deviceId]) {
      this.sendCommand$[command.deviceId] = new BehaviorSubject<any>({});

      if (!this.clientObj[command.deviceId]) {
        this.clientObj[command.deviceId] = this.webSocketClient(
          command.deviceId
        );
      }

      this.clientObj[command.deviceId].onConnect = (frame: any) => {
        this.clientObj[command.deviceId].publish({
          destination: `/ws/tracker-command`,
          body: JSON.stringify(command),
        });

        this.clientObj[command.deviceId].subscribe(
          `/ws/tracker-command-response/${command.manufDeviceId}`,
          (message: Message) => {
            const response = JSON.parse(message.body);
            console.log(response);
            this.sendCommand$[command.deviceId].next(response);
            this.websocketStatus$[command.deviceId].next(response);

            console.log(response);
          }
        );

        this.liveLocationWebsocket(command.deviceId);

        this.alarmWebsocket(command.deviceId);
      };

      this.clientObj[command.deviceId].onStompError = function (frame: any) {
        console.log('Additional details: ' + frame.body);
      };

      this.clientObj[command.deviceId].activate();
    }
    return this.sendCommand$[command.deviceId].asObservable();
  }

  deviceStatus(deviceId: string) {
    if (!this.websocketStatus$[deviceId])
      this.websocketStatus$[deviceId] = new BehaviorSubject<any>({});
    return this.websocketStatus$[deviceId].asObservable();
  }

  sendCommandAuthority(command: any) {
    this.sendAuthorityCommand$[command.deviceId] = new BehaviorSubject<any>({});

    if (!this.clientObj[command.deviceId]) {
      this.clientObj[command.deviceId] = this.webSocketClient(command.deviceId);
      console.log(command.deviceId);
    }

    this.sendCommandWebsocket(command, 'set-authority');

    return this.sendAuthorityCommand$[command.deviceId].asObservable();
  }

  setFence(command: any): Observable<any> {
    if (!this.setFence$[command.deviceId]) {
      this.setFence$[command.deviceId] = new BehaviorSubject<any>({});

      if (!this.clientObj[command.deviceId])
        this.clientObj[command.deviceId] = this.webSocketClient(
          command.deviceId
        );

      this.sendCommandWebsocket(command, 'set-fence');
    }
    return this.setFence$[command.deviceId].asObservable();
  }

  setUploadTime(command: any): Observable<any> {
    if (!this.setUploadTime$[command.deviceId]) {
      this.setUploadTime$[command.deviceId] = new BehaviorSubject<any>({});

      if (!this.clientObj[command.deviceId])
        this.clientObj[command.deviceId] = this.webSocketClient(
          command.deviceId
        );

      this.sendCommandWebsocket(command, 'upload-time');
    }
    return this.setUploadTime$[command.deviceId].asObservable();
  }

  cutOff(command: any): Observable<any> {
    if (!this.cutOff$[command.deviceId]) {
      this.cutOff$[command.deviceId] = new BehaviorSubject<any>({});

      if (!this.clientObj[command.deviceId])
        this.clientObj[command.deviceId] = this.webSocketClient(
          command.deviceId
        );

      this.sendCommandWebsocket(command, 'cut-off');
    }
    return this.cutOff$[command.deviceId].asObservable();
  }

  speedLimit(command: any): Observable<any> {
    if (!this.speedLimit$[command.deviceId]) {
      this.speedLimit$[command.deviceId] = new BehaviorSubject<any>({});

      if (!this.clientObj[command.deviceId])
        this.clientObj[command.deviceId] = this.webSocketClient(
          command.deviceId
        );

      this.sendCommandWebsocket(command, 'speed-limit');
    }
    return this.speedLimit$[command.deviceId].asObservable();
  }

  alarmStatus(deviceId: string) {
    if (!this.alarmSubjects$[deviceId]) {
      this.alarmSubjects$[deviceId] = new BehaviorSubject<any>({});
    }
    return this.alarmSubjects$[deviceId].asObservable();
    //for testing
    // return this.sendCommand$[deviceId].asObservable();
  }

  private alarmWebsocket(deviceId: string) {
    this.clientObj[deviceId].subscribe(
      `/ws/tracker/alarm/device-id/${deviceId}`,
      (message: Message) => {
        console.log(message.body, deviceId);
        console.log(deviceId);
        const location = JSON.parse(message.body);
        console.log(location);

        this.alarmSubjects$[deviceId].next(location);
      }
    );
  }

  private webSocketClient(deviceId: string) {
    return new Client({
      debug: function (str) {},
      webSocketFactory() {
        return new SockJS(
          `${environment.apiServerEndpoint}/tracker?trackingDeviceId=${deviceId}`
        );
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  private liveLocationWebsocket(deviceId: string) {
    this.clientObj[deviceId].subscribe(
      `/ws/tracker/live-data/device-id/${deviceId}`,
      (message: Message) => {
        // console.log(message.body, deviceId);
        console.log(deviceId);
        const location = JSON.parse(message.body);
        console.log(location);

        const tracker = { deviceId: deviceId, location };
        this.trackerSubjects[deviceId].next(location);
      },
      { trackingDeviceId: deviceId, connectionType: 'tracker' }
    );
  }

  private sendCommandWebsocket(command: any, actionType: Command) {
    this.clientObj[command.deviceId].publish({
      destination: `/ws/tracker-command`,
      body: JSON.stringify(command),
    });

    this.clientObj[command.deviceId].subscribe(
      `/ws/tracker-command-response/${command.manufDeviceId}`,
      (message: Message) => {
        const response = JSON.parse(message.body);
        if (actionType === 'device-status')
          this.sendCommand$[command.deviceId].next(response);
        if (actionType === 'set-authority')
          this.sendAuthorityCommand$[command.deviceId].next(response);
        if (actionType === 'set-fence')
          this.setFence$[command.deviceId].next(response);
        if (actionType === 'upload-time')
          this.setUploadTime$[command.deviceId].next(response);
        if (actionType === 'cut-off')
          this.cutOff$[command.deviceId].next(response);
        console.log(response);
      }
    );
    // };
  }
}
