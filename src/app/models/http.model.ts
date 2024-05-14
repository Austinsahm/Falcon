export interface HttpResp<T> {
  statusCode: string;
  response: T;
  error: Error;
}

/**
 * API status code
 */
export const enum StatusCode {
  OK = 'OK',
  UNKNOWN = 'UNKNOWN',
  NOT_FOUND = 'NOT_FOUND',
  CREATED = 'CREATED',
  SUCCESS = 'SUCCESS'
}

export const enum WriteStatusCode {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

/**
* API response structure
*/
export interface Response<T> {
  statusCode: StatusCode;
  response: T;
}

export interface WriteResponsePayload {
  status: WriteStatusCode,
  description?: string;
}

/**
* Holds messages/translations for API status codes
*/
export const StatusMessageBag = new Map<StatusCode, string>([
  [StatusCode.OK, 'Request processed successfully.'],
  [StatusCode.NOT_FOUND, 'Requested item not found.'],
  [StatusCode.UNKNOWN, 'Sorry, something went wrong.']
]);

/**
* API Exception class
*/
export class Exception extends Error {
  constructor(public readonly code: StatusCode) {
      super(StatusMessageBag.get(code) || code);
  }
}

/**
* Predefined exceptions
*/
export const ExceptionBag: Record<StatusCode, Exception> = {
  OK: new Exception(StatusCode.OK),
  UNKNOWN: new Exception(StatusCode.UNKNOWN),
  NOT_FOUND: new Exception(StatusCode.NOT_FOUND),
  CREATED: new Exception(StatusCode.CREATED),
  SUCCESS: new Exception(StatusCode.SUCCESS)
};


export enum ErrorResponse{
  NOT_FOUND ='Requested item not found.',
}