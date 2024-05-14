export class Gps {}

export interface AddressData {
  results: [{ formatted_address: string }];
}

export interface Points {
  lat: number;
  lng: number;
  index?: number;
}

export interface DeviceCoordinates extends Points {
  deviceId: string;
  time: string;
  seqNumber: number;
  status: Status;
  speed: number;
  address: string;
}

export enum ShapeName {
  circle = 'CIRCLE',
  rect = 'RECTANGLE',
  polygon = 'POLYGON',
  triangle = 'TRIANGLE',
}

export interface RectPoints {
  east?: number;
  west?: number;
  north?: number;
  south?: number;
}

export interface PolygonPoints {}

export interface Shape {
  code: string;
  name: ShapeName;
  radius?: string;
  points: Points[] | RectPoints[];
  headerId?: string;
  headerName?: string;
}

export interface ShapeData {
  code: string;
  name: ShapeName;
  radius?: string;
  points: Points[] | RectPoints[];
  height?: number;
  width?: number;
}

export interface ShapeDataForm {
  headerName: string;
  categoryId: string;
  shapes: Shape[];
  headerId: string;
}

// export interface DeviceCoordinates extends Points {
//   time: string;
//   seqNumber: number;
//   status: status[];
// }

export interface Status {
  stopped: boolean;
  time: any;
}

export interface GeofencingHeaderResponse {
  geofencing_hder_id: string;
  geofencing_hder_name: string;
  client_device_categ_id: string;
}

export interface FenceCategoryResponse {
  categoryId: string;
  shapes: FenceShape[];
}

export interface FenceShape {
  code: string;
  name: ShapeName;
  radius?: string;
  points: Points[] | RectPoints[];
  headerId?: string;
  headerName?: string;
  fenceType: string;
}
