import { InternalError } from '@src/util/error/internal-error';
import config, { IConfig } from 'config';
import * as HTTPUtil from '@src/util/request';

const API_KEY = '';
// '395497fe-480e-11ed-a138-0242ac130002-39549858-480e-11ed-a138-0242ac130002';

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  readonly time: string;
  swellDirection: StormGlassPointSource;
  swellHeight: StormGlassPointSource;
  swellPeriod: StormGlassPointSource;
  waveDirection: StormGlassPointSource;
  waveHeight: StormGlassPointSource;
  windDirection: StormGlassPointSource;
  windSpeed: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  waveDirection: number;
  waveHeight: number;
  windDirection: number;
  windSpeed: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalError =
      'Unexpected error when trying to communicate to StormGlass';
    super(`${internalError}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalError = 'Unexpected error returned by the StormGlass service';
    super(`${internalError}: ${message}`);
  }
}

const stormGlassConfig: IConfig = config.get('App.resources.StormGlass');

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  constructor(
    protected request: HTTPUtil.Request = new HTTPUtil.Request(
      stormGlassConfig.get('apiUrl'),
      {
        'Content-Type': 'application/json',
        Authorization: stormGlassConfig.get('apiToken'),
      }
    )
  ) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const { data } = await this.request.get<StormGlassForecastResponse>(
        `/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`
      );
      return Promise.resolve(this.normalizeResponse(data));
    } catch (err) {
      if (HTTPUtil.Request.isRequestError(err)) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify((err as HTTPUtil.RequestError).response?.data)} Code: ${(err as HTTPUtil.RequestError).response?.status}`
        );
      }
      throw new ClientRequestError((err as Error).message);
    }
  }

  private normalizeResponse(
    response: StormGlassForecastResponse
  ): ForecastPoint[] {
    return response.hours
      .filter(this.isPointValid.bind(this))
      .map((hour: StormGlassPoint) => ({
        time: hour.time,
        swellDirection: hour.swellDirection[this.stormGlassAPISource],
        swellHeight: hour.swellHeight[this.stormGlassAPISource],
        swellPeriod: hour.swellPeriod[this.stormGlassAPISource],
        waveDirection: hour.waveDirection[this.stormGlassAPISource],
        waveHeight: hour.waveHeight[this.stormGlassAPISource],
        windDirection: hour.windDirection[this.stormGlassAPISource],
        windSpeed: hour.windSpeed[this.stormGlassAPISource],
      }));
  }

  private isPointValid(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}
