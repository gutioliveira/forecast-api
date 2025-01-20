import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import axios from 'axios';
import _ from 'lodash';

jest.mock('axios');

describe('StormGlass client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const lat = -33.792726;
  const lng = 151.289824;


  it('should return the normalized forecast from the StormGlass service', async () => {
    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture });
    const stormGlass = new StormGlass(mockedAxios);
    const forecast = await stormGlass.fetchPoints(lat, lng);
    expect(forecast).toEqual(stormGlassNormalized3HoursFixture);
    expect(forecast.length).toBe(3);
  });

  it ('should return filtered normalized forecast from the StormGlass service if not all items are valid', async () => {
    const stormGlassWeather3HoursFixtureCopy = _.cloneDeep(stormGlassWeather3HoursFixture);
    stormGlassWeather3HoursFixtureCopy.hours[0].swellDirection.noaa = 0;
    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixtureCopy });
    const stormGlass = new StormGlass(mockedAxios);
    const forecast = await stormGlass.fetchPoints(lat, lng);
    expect(forecast.length).toBe(2);
  })
});
