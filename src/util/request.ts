import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

export interface Response<T = any> extends AxiosResponse<T> {}

export interface RequestError extends AxiosError {}

export class Request {
  private request: AxiosInstance;

  constructor(baseURL: string, headers: object = {}) {
    this.request = axios.create({
      baseURL,
      headers,
    });
  }

  public get<T>(
    path: string,
    additionalHeaders?: object
  ): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(path, {
      headers: {
        ...(additionalHeaders ?? {}),
      },
    });
  }

  public static isRequestError(err: unknown) {
    return !!(
      (err as RequestError).response && (err as RequestError).response?.status
    );
  }
}
