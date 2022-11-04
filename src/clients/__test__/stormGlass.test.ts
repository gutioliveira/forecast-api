import { StormGlass } from '@src/clients/stormGlass';
import StormGlassWeather3Hours from '@test/fixtures/stormglass_weather_3_hours.json';
import StormGlassNormalizedResponse3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import axios from 'axios';

jest.mock('axios');

describe('StormGlass client', () => {

  const lat = -33.792726;
  const lng = 151.289824;

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  it('should return the normalized forescast from the StormGlass service', async () => {
    mockedAxios.get.mockResolvedValue({data: StormGlassWeather3Hours});

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    return expect(response).toEqual(StormGlassNormalizedResponse3Hours);
  });

  it('should an empty array if none of the points are valid', async () => {
    const stormGlassWeather3HoursCopy = Object.assign({}, StormGlassWeather3Hours);
    stormGlassWeather3HoursCopy.hours = stormGlassWeather3HoursCopy.hours.map((h) => ({...h, swellDirection: {noaa: 0.0}}));

    mockedAxios.get.mockResolvedValue({data: stormGlassWeather3HoursCopy});

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    return expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass when the request fails before reaching the service', async () => {
    const genericError = {message: 'Network error'};
    mockedAxios.get.mockRejectedValue(genericError);
    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(genericError.message);
  });

  it('should get a StormGlassResponseError when the request receives an error from StormGlass', async () => {
    const stormGlassResponseError = {
      response: {
        status: 429,
        data: {
          errors: ['Rate limit reached']
        }
      }
    };
    mockedAxios.get.mockRejectedValue(stormGlassResponseError);
    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(stormGlassResponseError.response.data.errors[0]);
  });
});