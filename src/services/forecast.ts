import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import { InternalError } from '@src/util/error/internal-error';

export interface Beach {
  lat: number;
  lng: number;
  name: string;
  position: string;
  user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {
  rating: number;
}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class Forecast {
  constructor(protected stormGlass: StormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    try {
      const beachForecast = await this.processPoints(beaches);
      return this.groupBeachForecastsByTime(beachForecast);
    } catch (e) {
      throw new ForecastProcessingInternalError((e as Error).message);
    }
  }

  private async processPoints(beaches: Beach[]): Promise<BeachForecast[]> {
    const beachForecasts: BeachForecast[] = [];
    for (const beach of beaches) {
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
      points.forEach((point) => {
        beachForecasts.push({
          ...{
            lat: beach.lat,
            lng: beach.lng,
            name: beach.name,
            position: beach.position,
          },
          rating: 1, // TODO: remove current hardcoded value
          ...point,
        });
      });
    }
    return beachForecasts;
  }

  private groupBeachForecastsByTime(
    beachForecast: BeachForecast[]
  ): TimeForecast[] {
    const timeKeyMapped: { [key: string]: BeachForecast[] } = {};
    beachForecast.forEach((beachForecast) => {
      if (timeKeyMapped[beachForecast.time]) {
        timeKeyMapped[beachForecast.time].push(beachForecast);
      } else {
        timeKeyMapped[beachForecast.time] = [beachForecast];
      }
    });
    return Object.keys(timeKeyMapped).map((key) => ({
      time: key,
      forecast: timeKeyMapped[key],
    }));
  }
}
