import { InternalError } from '@src/util/errors/internal-error';
import config, { IConfig } from 'config';
import * as HTTPUtil from '@src/util/request';

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly waveHeight: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface StormGlassForecastResponseNormalized {
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  time: string;
  waveDirection: number;
  waveHeight: number;
  windDirection: number;
  windSpeed: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected error when trying to comunicate with StormGlass: ${message}`;
    super(internalMessage, 500);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormglassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  private params =
    'swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed';
  private source = 'noaa';

  constructor(private request = new HTTPUtil.Request()) {}

  public async fetchPoints(lat: number, lng: number) {
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${stormglassResourceConfig.get('apiUrl')}/weather/point?params=${this.params}&source=${this.source}&lat=${lat}&lng=${lng}`,
        {
          headers: {
            Authorization: stormglassResourceConfig.get('apiToken'),
          },
        }
      );
      return this.normalizeData(response.data);
    } catch (err: unknown) {
      if (err instanceof Error && HTTPUtil.Request.isRequestError(err)) {
        const error = HTTPUtil.Request.extractErrorData(err);
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(error.data)} Code: ${error.status}`
        );
      }
      /**
       * All the other errors will fallback to a generic client error
       */
      throw new ClientRequestError(JSON.stringify(err));
    }
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.source] &&
      point.swellHeight?.[this.source] &&
      point.swellPeriod?.[this.source] &&
      point.waveDirection?.[this.source] &&
      point.waveHeight?.[this.source] &&
      point.windDirection?.[this.source] &&
      point.windSpeed?.[this.source]
    );
  }

  private normalizeData(
    response: StormGlassForecastResponse
  ): StormGlassForecastResponseNormalized[] {
    return response.hours
      .filter(this.isValidPoint.bind(this))
      .map((hour: StormGlassPoint) => ({
        swellDirection: hour.swellDirection.noaa,
        swellHeight: hour.swellHeight.noaa,
        swellPeriod: hour.swellPeriod.noaa,
        time: hour.time,
        waveDirection: hour.waveDirection.noaa,
        waveHeight: hour.waveHeight.noaa,
        windDirection: hour.windDirection.noaa,
        windSpeed: hour.windSpeed.noaa,
      }));
  }
}
