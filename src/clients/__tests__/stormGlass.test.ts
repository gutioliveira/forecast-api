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

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
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
    mockedAxios.get.mockResolvedValue({ data: incompleteForecast });
    const stormGlass = new StormGlass(mockedAxios);
    const forecast = await stormGlass.fetchPoints(lat, lng);
    expect(forecast).toEqual([]);
  });

  it('should return filtered normalized forecast from the StormGlass service if not all items are valid', async () => {
    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });
    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow('Error');
  });
});
