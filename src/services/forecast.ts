import { StormGlass } from "@src/clients/stormGlass";

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach {
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
  rating: number;
}

export interface ForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()){}

  public async processForecastForBeaches(beaches: Beach[]): Promise<ForecastPoint[]> {
    const pointsWithCorrectSources: ForecastPoint[] = [];
    for (const beach of beaches){
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
      const enrichedBeachData = points.map((e) => ({
        ...{},
        ...{
          lat: beach.lat,
          lng: beach.lng,
          name: beach.name,
          position: beach.position,
          rating: 1, //need to be implemented
        },
        ...e,
      }));
      pointsWithCorrectSources.push(...enrichedBeachData);
    }
    return pointsWithCorrectSources;
  }
}