import { CompanyTypeCode } from "./company.model";

/**
 * Domain/Company subdomain model
 */
export interface Domain {
    bodyColour: string;
    companyName: string;
    companyType: CompanyTypeCode;
    footerColour: string;
    headerColour: string;
    logo: string;
    //userCompanyId: string;
    companyId: string;
    sideBarColor: string;
    headerFontColour: string;
    formColor: string;
    footerFontColour: string;
    formFontType: string;
    formFontColor: string;
    primaryColour:string
    secondaryColour:string
    tertiaryColour:string
}


