export class Device {}

/**
 * Device status
 */
export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ALL = 'ALL',
}

/**
 * Device model
 */
export interface Device {
  deviceId: string;
  deviceName: string;
  assetId: string;
  assetName?: string;
  companyId?: string;
  companyName?: string;
  deviceCategName?: string;
  deviceCategoryName?: string;
  locationId?: String;
  locationName?: string;
  statusId: String;
  statusName?: DeviceStatus;
  locationAddress1?: String;
  locationAddress2: String;
  manufDeviceId?: string;
  networkId: string;
  networkName: string;
}

export interface DeviceDetail {
  deviceId: string;
  manufDeviceId: string;
  deviceName: string;
  deviceDesc: string;
  devicePac: string;
  clientDeviceCategId: string;
  clientDeviceCategName: string;
  networkId: string;
  networkName: string;
  manufacturerId: string;
  manufacturerName: string;
  manufDeviceTypeId: string;
  manufDeviceTypeName: string;
  assetId: string;
  assetName: string;
  statusId: string;
  statusName: string;
  lastSeenDate: Date;
  lastSeenMsgId: string;
  certificate: string;
  companyId?: string;
  userId?: string;
}

export interface DeviceFormData extends DeviceDetail {
  // userCompanyId: string;
  minSpeed: number;
  maxSpeed: number;
}

export interface DeviceCategoryDirectory {
  deviceCategId: string;
  deviceCategName: string;
  companyName: string;
  companyId?: string;
  networkId: string;
  networkName: string;
}

export interface DeviceConfigurationDirectory {
  configId: string;
  deviceId: string;
  alertMethod?: string;
  alertMethodVal1?: string;
  alertMethodVal2?: string;
  manufDeviceId: string;
  deviceName: string;
  assetId: string;
  assetName: string;
  manufDeviceTypeId: string;
  deviceTypeName: string;
  statusId: string;
  statusName: string;
  manufacturerId: string;
  manufacturerName: string;
  companyId: string;
  companyName: string;
  useCaseId: string;
  useCaseName: string;
  phoneNumb1?: string;
  phoneNumb2?: string;
  emailAddr1?: string;
  emailAddr2?: string;
}

export interface AlarmReport {
  deviceId: string;
  attribute: string;
  attributeValue: string;
  devNetwkTime: Date;
  netwkSeqNo: number;
  dataSrc: number;
  count: number;
}
