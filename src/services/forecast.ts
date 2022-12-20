import { StormGlass, StormGlassForecastResponseNormalized } from '@src/clients/stormGlass';
import { Beach } from '@src/models/beach';
import { InternalError } from '@src/util/errors/internal-error';

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

export interface ForecastPointsGroupedByTime {
  time: string;
  forecast: BeachForecast[]
}

export class ForecastServiceError extends InternalError {
  constructor(message: string){
    super(`Error while trying to receive forecast: ${message}`);
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<ForecastPointsGroupedByTime[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];
    try {
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
        const enrichedBeachData = this.enrichBeachData(beach, points);
        pointsWithCorrectSources.push(...enrichedBeachData);
      }
      return this.groupByTime(pointsWithCorrectSources);
    } catch(error: unknown) {
      throw new ForecastServiceError(error instanceof Error ? error.message : '');
    }
  }

  private enrichBeachData(beach: Beach, points: StormGlassForecastResponseNormalized[]){
    return points.map((e) => ({
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
  }

  private groupByTime(forecastPoints: BeachForecast[]): ForecastPointsGroupedByTime[] {
    const timeMap: {[time: string]: BeachForecast[]} = {};
    forecastPoints.forEach((current: BeachForecast) => {
      const object = Object.assign({}, current);
      if (timeMap[current.time]){
        timeMap[current.time].push(object);
      } else {
        timeMap[current.time] = [object]
      }
    });
    return Object.keys(timeMap).map((key) => ({
      time: key,
      forecast: timeMap[key]
    }));
  }
}
