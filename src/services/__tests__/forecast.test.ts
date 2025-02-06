import { StormGlass } from '@src/clients/stormGlass';
import stormGlassClientNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import {
  Forecast,
  ForecastProcessingInternalError,
} from '@src/services/forecast';
import { GeoPosition } from '@src/models/beach';

jest.mock('@src/clients/stormGlass');

describe('Forecast Service', () => {
  const beach = {
    lat: -33.792726,
    lng: 151.289824,
    name: 'Manly',
    position: GeoPosition.E,
  };
  const mockedStormGlassService = new StormGlass() as jest.Mocked<StormGlass>;

  it('should return the forecast for a list of beaches', async () => {
    mockedStormGlassService.fetchPoints = jest
      .fn()
      .mockResolvedValue(stormGlassClientNormalizedResponseFixture);
    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            ...beach,
            rating: 1,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 3.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 0.47,
            windDirection: 299.45,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T01:00:00+00:00',
        forecast: [
          {
            ...beach,
            rating: 1,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T01:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T02:00:00+00:00',
        forecast: [
          {
            ...beach,
            rating: 1,
            swellDirection: 182.56,
            swellHeight: 0.28,
            swellPeriod: 3.44,
            time: '2020-04-26T02:00:00+00:00',
            waveDirection: 232.86,
            waveHeight: 0.46,
            windDirection: 321.5,
            windSpeed: 100,
          },
        ],
      },
    ];
    const forecastService = new Forecast(mockedStormGlassService);
    const beachesWithRatings = await forecastService.processForecastForBeaches([
      beach,
    ]);
    expect(beachesWithRatings).toEqual(expectedResponse);
  });

  it('should return the forecast for a list of beaches', async () => {
    const forecastService = new Forecast(mockedStormGlassService);
    const beachesWithRatings = await forecastService.processForecastForBeaches(
      []
    );
    expect(beachesWithRatings).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong in the processing', async () => {
    mockedStormGlassService.fetchPoints = jest.fn().mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });
    const forecastService = new Forecast(mockedStormGlassService);
    await expect(
      forecastService.processForecastForBeaches([beach])
    ).rejects.toThrow(ForecastProcessingInternalError);
  });
});
