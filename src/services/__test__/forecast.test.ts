import { BeachPosition, Forecast, ForecastPoint } from "../forecast";
import StormGlassNormalizedResponse3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json'
import { StormGlass } from "@src/clients/stormGlass";

jest.mock('@src/clients/stormGlass');

describe('Forecast Service', () => {

  const lat = -33.792726;
  const lng = 151.289824;

  it('should return the forescast for a list of Beaches', async () => {
    const mockedStormGlass = new StormGlass as jest.Mocked<StormGlass>;
    mockedStormGlass.fetchPoints.mockResolvedValue(StormGlassNormalizedResponse3Hours);
    const expectedResponse: ForecastPoint[] = [...StormGlassNormalizedResponse3Hours];
    const forecast = new Forecast(mockedStormGlass);
    const beaches = [
      {
        name: 'name',
        position: BeachPosition.N,
        lat,
        lng,
        rating: 1,
      }
    ];
    const response = await forecast.processForecastForBeaches(beaches);
    return expect(response).toEqual(expectedResponse.map((e) => ({...e, ...beaches[0]})));
  });
});