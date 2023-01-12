import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export enum HTTP_CODES {
  VALIDATION_ERROR = 422,
  CONFLICT = 409,
  NOT_FOUND = 404,
  OK = 200,
  CREATED = 201,
  INTERNAL_SERVER_ERROR = 500,
}

export enum RESPONSE_MESSAGES {
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
  EMAIL_PASSWORD_WRONG = 'Email or Password invalid'
}

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface RequestConfig extends AxiosRequestConfig {}
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Response<T = any> extends AxiosResponse<T> {}

export class Request {
  constructor(private request = axios) {}

  public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config);
  }

  public static isRequestError(error: Error): boolean {
    return !!(
      (error as AxiosError).response && (error as AxiosError).response?.status
    );
  }

  public static extractErrorData(
    error: unknown
  ): Pick<AxiosResponse, 'data' | 'status'> {
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.status) {
      return {
        data: axiosError.response.data,
        status: axiosError.response.status,
      };
    }
    throw Error(`The error ${error} is not a Request Error`);
  }
}
