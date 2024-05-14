import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { JSONSchema } from '@ngx-pwa/local-storage';

export enum UserRoleCode {
  ADMINISTRATOR = '1',
  PUBLIC = '2',
}

export interface UserSessionInformation {
  userId: string;
  firstName: string;
  userCompanyId: string;
  companyName: string;
  companyTypeName: string;
  roleId: string;
  roleName: string;
  countryId: string;
  numActiveDevice?: number;
  numInactiveDevice?: number;
  numPartner?: number;
  numCorporate?: number;
  numIndividual?: number;
  creditBalance: string;
  overdraftLimit: number;
  logo: string;
}

export const userSchema: JSONSchema = {
  type: 'object',
  properties: {
    userId: { type: 'string' },
    firstName: { type: 'string' },
    userCompanyId: { type: 'string' },
    companyName: { type: 'string' },
    companyTypeName: { type: 'string' },
    roleId: { type: 'string' },
    roleName: { type: 'string' },
    countryId: { type: 'string' },
    // numActiveDevice: { type: 'number' },
    // numInactiveDevice: { type: 'number' },
    // numPartner: { type: 'number' },
    // numCorporate: { type: 'number' },
    // numIndividual: { type: 'number' },
    creditBalance: { type: 'string' },
    overdraftLimit: { type: 'number' },
    logo: { type: 'string' },
  },
};

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {
//   apiEndpoint: string;

//   constructor(
//     private http: HttpClient,
//   ) {
//     this.apiEndpoint = environment.apiServerEndpoint;
//    }

// }
