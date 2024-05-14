export class Dashboard {}

export interface DashboardDevice {
  deviceId: string;
  manufDeviceId: string;
  deviceName: string;
  certificate: string;
  companyId: string;
  companyName: string;
  devicePac: string;
  manufDeviceTypeId: string;
  deviceDesc: string;
  clientDeviceCategId: string;
  minSpeed: number;
  maxSpeed: number;
  deviceStatus: string;
  lastSeenDate: Date;
}

export interface DashboardDirectory {
  dashboardId?: string;
  deviceId?: string;
  dashboardName?: string;
  manufDeviceId?: string;
  deviceName?: string;
  companyId?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
}
