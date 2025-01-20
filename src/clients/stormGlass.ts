import { InternalError } from '@src/error/internal-error';
import axios, { AxiosInstance, AxiosStatic } from 'axios';

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
    const internalError = 'Unexpected error when trying to communicate to StormGlass';
    super(`${internalError}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalError = 'Unexpected error returned by the StormGlass service';
    super(`${internalError}: ${message}`);
  }
}

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  constructor(
    protected request: AxiosInstance = axios.create({
      baseURL: 'https://api.stormglass.io/v2',
      headers: {
        'Content-Type': 'application/json',
        Authorization: API_KEY,
      },
    })
  ) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const { data } = await this.request.get<StormGlassForecastResponse>(
        `/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`
      );
      return Promise.resolve(this.normalizeResponse(data));
    } catch (err) {
      console.log(`errr123`, err);
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
