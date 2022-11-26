import { StormGlass } from '@src/clients/stormGlass';
import StormGlassWeather3Hours from '@test/fixtures/stormglass_weather_3_hours.json';
import StormGlassNormalizedResponse3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import * as HTTPUtil from '@src/util/request';

jest.mock('@src/util/request');

describe('StormGlass client', () => {
  const lat = -33.792726;
  const lng = 151.289824;

  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

  it('should return the normalized forescast from the StormGlass service', async () => {
    mockedRequest.get.mockResolvedValue({
      data: StormGlassWeather3Hours,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);
    return expect(response).toEqual(StormGlassNormalizedResponse3Hours);
  });

  it('should an empty array if none of the points are valid', async () => {
    const stormGlassWeather3HoursCopy = Object.assign(
      {},
      StormGlassWeather3Hours
    );
    stormGlassWeather3HoursCopy.hours = stormGlassWeather3HoursCopy.hours.map(
      (h) => ({ ...h, swellDirection: { noaa: 0.0 } })
    );

    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3HoursCopy,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);
    return expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass when the request fails before reaching the service', async () => {
    const genericError = { message: 'Network error' };
    mockedRequest.get.mockRejectedValue(genericError);
    const stormGlass = new StormGlass(mockedRequest);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      genericError.message
    );
  });

  it('should get a StormGlassResponseError when the request receives an error from StormGlass', async () => {
    const stormGlassResponseError = {
      response: {
        status: 429,
        data: {
          errors: ['Rate limit reached'],
        },
      },
    };
    MockedRequestClass.isRequestError.mockReturnValue(true);
    mockedRequest.get.mockRejectedValue(stormGlassResponseError);
    const stormGlass = new StormGlass(mockedRequest);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      stormGlassResponseError.response.data.errors[0]
    );
  });
});
