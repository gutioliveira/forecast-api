import { ForecastPoint } from '@src/clients/stormGlass';
import { Beach, GeoPosition } from '@src/models/beach';

// meters
const waveHeights = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waistHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};

export class Rating {
  constructor(private beach: Beach) {}

  public getRatingForPoint(forecastPoint: ForecastPoint): number {
    const wavePosition = this.getPositionFromLocation(
      forecastPoint.waveDirection
    );
    const windPosition = this.getPositionFromLocation(
      forecastPoint.windDirection
    );

    const rates = [
      this.getRatingBasedOnWindAndWavePositions(wavePosition, windPosition),
      this.getRatingForSwellPeriod(forecastPoint.swellPeriod),
      this.getRatingForSwellSize(forecastPoint.swellHeight),
    ];

    return Math.round(
      rates.reduce((acc, current) => acc + current, 0) / rates.length
    );
  }

  public getRatingBasedOnWindAndWavePositions(
    waveDirection: GeoPosition,
    windDirection: GeoPosition
  ): number {
    // if wind is onshore, low rating
    if (waveDirection === windDirection) {
      return 1;
    } else if (this.isWindOffShore(waveDirection, windDirection)) {
      return 5;
    }
    // cross winds gets 3
    return 3;
  }

  private isWindOffShore(
    waveDirection: string,
    windDirection: string
  ): boolean {
    return (
      (waveDirection === GeoPosition.N &&
        windDirection === GeoPosition.S &&
        this.beach.position === GeoPosition.N) ||
      (waveDirection === GeoPosition.S &&
        windDirection === GeoPosition.N &&
        this.beach.position === GeoPosition.S) ||
      (waveDirection === GeoPosition.E &&
        windDirection === GeoPosition.W &&
        this.beach.position === GeoPosition.E) ||
      (waveDirection === GeoPosition.W &&
        windDirection === GeoPosition.E &&
        this.beach.position === GeoPosition.W)
    );
  }

  /**
   * Rate will start from 1 given there will be always some wave period
   */
  public getRatingForSwellPeriod(period: number): number {
    if (period >= 7 && period < 10) {
      return 2;
    }

    if (period >= 10 && period < 14) {
      return 4;
    }
    if (period >= 14) {
      return 5;
    }

    return 1;
  }

  /**
   * Rate will start from 1 given there will always some wave height
   */
  public getRatingForSwellSize(height: number): number {
    if (
      height >= waveHeights.ankleToKnee.min &&
      height < waveHeights.ankleToKnee.max
    ) {
      return 2;
    }
    if (
      height >= waveHeights.waistHigh.min &&
      height < waveHeights.waistHigh.max
    ) {
      return 3;
    }
    if (height >= waveHeights.headHigh.min) {
      return 5;
    }

    return 1;
  }

  public getPositionFromLocation(coordinates: number): GeoPosition {
    if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0)) {
      return GeoPosition.N;
    }
    if (coordinates >= 50 && coordinates < 120) {
      return GeoPosition.E;
    }
    if (coordinates >= 120 && coordinates < 220) {
      return GeoPosition.S;
    }
    if (coordinates >= 220 && coordinates < 310) {
      return GeoPosition.W;
    }
    return GeoPosition.E;
  }
}
