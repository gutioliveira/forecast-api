import { StormGlass } from '@src/clients/stormGlass';
import StormGlassWeather3Hours from '@test/fixtures/stormglass_weather_3_hours.json';
import StormGlassNormalizedResponse3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import axios from 'axios';

jest.mock('axios');

describe('StormGlass client', () => {
  it('should return the normalized forescast from the StormGlass service', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockResolvedValue({data: StormGlassWeather3Hours});

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    return expect(response).toEqual(StormGlassNormalizedResponse3Hours);
  });
});