import { StormGlass } from '@src/clients/stormGlass';
import * as HTTPUtil from '@src/util/request';
import config, { IConfig } from 'config';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import _ from 'lodash';

jest.mock('@src/util/request');

const testConfig: IConfig = config.get('App.resources.StormGlass');

describe('StormGlass client', () => {
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>
  const mockedRequest = new HTTPUtil.Request(testConfig.get('apiUrl'), {
    Authorization: testConfig.get('apiToken'),
  }) as jest.Mocked<HTTPUtil.Request>;
  const lat = -33.792726;
  const lng = 151.289824;

  it('should return the normalized forecast from the StormGlass service', async () => {
    mockedRequest.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture } as HTTPUtil.Response);
    const stormGlass = new StormGlass(mockedRequest);
    const forecast = await stormGlass.fetchPoints(lat, lng);
    expect(forecast).toEqual(stormGlassNormalized3HoursFixture);
    expect(forecast.length).toBe(3);
  });

  it('should return filtered normalized forecast from the StormGlass service if not all items are valid', async () => {
    const incompleteForecast = {
      time: 'time',
      hours: [
        {
          swellDirection: {
            noaa: 0,
          },
        },
      ],
    };
    mockedRequest.get.mockResolvedValue({ data: incompleteForecast } as HTTPUtil.Response);
    const stormGlass = new StormGlass(mockedRequest);
    const forecast = await stormGlass.fetchPoints(lat, lng);
    expect(forecast).toEqual([]);
  });

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });
    const stormGlass = new StormGlass(mockedRequest);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });
    MockedRequestClass.isRequestError.mockReturnValue(true)

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
