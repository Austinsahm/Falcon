import { CompanyTypeCode } from "./company.model";

export interface LoginDetails {
    userId: string;
    password: string;
}

export interface UserInfo {
    userId: string;
    firstName: string;
    userCompanyId: string;
    companyName: string;
    companyTypeName: CompanyTypeCode;
    roleId: string;
    roleName: string;
    countryId: string;
    numActiveDevice: number;
    numInactiveDevice: number;
    numPartner: number;
    numCorporate: number;
    numIndividual: number;
    creditBalance: string;
    overdraftLimit: number;
    logo:string
  }
  