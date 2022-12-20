import { Forecast, ForecastServiceError } from '../forecast';
import StormGlassNormalizedResponse3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import { StormGlass } from '@src/clients/stormGlass';
import { BeachPosition } from '@src/models/beach';

jest.mock('@src/clients/stormGlass');

describe('Forecast Service', () => {
  const lat = -33.792726;
  const lng = 151.289824;

  it('should return the forescast grouped by time for a list of beaches', async () => {
    const mockedStormGlass = new StormGlass() as jest.Mocked<StormGlass>;
    mockedStormGlass.fetchPoints.mockResolvedValue(
      StormGlassNormalizedResponse3Hours
    );
    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 3.89,
            waveDirection: 231.38,
            waveHeight: 0.47,
            windDirection: 299.45,
            windSpeed: 100,
            time: '2020-04-26T00:00:00+00:00',
            name: 'name',
            position: BeachPosition.N,
            lat,
            lng,
            rating: 1,
          },
        ],
      },
      {
        time: '2020-04-26T01:00:00+00:00',
        forecast: [
          {
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
            time: '2020-04-26T01:00:00+00:00',
            name: 'name',
            position: BeachPosition.N,
            lat,
            lng,
            rating: 1,
          },
        ]
      },
      {
        time: '2020-04-26T02:00:00+00:00',
        forecast: [
          {
            swellDirection: 182.56,
            swellHeight: 0.28,
            swellPeriod: 3.44,
            waveDirection: 232.86,
            waveHeight: 0.46,
            windDirection: 321.5,
            windSpeed: 100,
            time: '2020-04-26T02:00:00+00:00',
            name: 'name',
            position: BeachPosition.N,
            lat,
            lng,
            rating: 1,
          },
        ]
      }
    ];
    const forecast = new Forecast(mockedStormGlass);
    const beaches = [
      {
        name: 'name',
        position: BeachPosition.N,
        lat,
        lng,
        rating: 1,
      },
    ];
    const response = await forecast.processForecastForBeaches(beaches);
    return expect(response).toEqual(expectedResponse);
  });

  it('should return an empty list when beaches array is empty', async () => {
    const forecast = new Forecast();
    const response = await forecast.processForecastForBeaches([]);
    return expect(response).toEqual([]);
  });

  it('should throw internal error if something goes wrong', async () => {
    const mockedStormGlass = new StormGlass() as jest.Mocked<StormGlass>;
    const internalError = {
      message: 'internal error'
    };
    mockedStormGlass.fetchPoints.mockRejectedValue(
      internalError
    );
    const beaches = [
      {
        name: 'name',
        position: BeachPosition.N,
        lat,
        lng,
        rating: 1,
      },
    ];
    const forecast = new Forecast(mockedStormGlass);
    return await expect(forecast.processForecastForBeaches(beaches)).rejects.toThrow(
      ForecastServiceError
    );
  });
});
