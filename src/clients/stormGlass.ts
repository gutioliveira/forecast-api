import axios, { AxiosInstance, AxiosStatic } from 'axios';

const API_KEY = '395497fe-480e-11ed-a138-0242ac130002-39549858-480e-11ed-a138-0242ac130002';

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

export class StormGlass {

  private params = 'swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed';
  private source = 'noaa';

  private request: AxiosInstance; 

  constructor(request?: AxiosStatic){
    this.request = request || axios.create({
      baseURL: `https://api.stormglass.io/v2/weather`,
      headers: {
        Authorization: API_KEY
      }
    });
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

  private normalizeData(response: StormGlassForecastResponse): StormGlassForecastResponseNormalized[]{
    return response.hours.filter(this.isValidPoint.bind(this)).map((hour: StormGlassPoint) => ({
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

  public async fetchPoints(lat: number, lng: number){
    const response = await this.request.get<StormGlassForecastResponse>(`/point?params=${this.params}&source=${this.source}&lat=${lat}&lng=${lng}`);
    return this.normalizeData(response.data);
  }
}