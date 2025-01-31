import nock from 'nock';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiResponseForecast3Hours from '@test/fixtures/api_response_forecast_3_hours.json';
import { Beach } from '@src/models/beach';
import { User } from '@src/models/user';
import { AuthService } from '@src/services/auth';

describe('Forecast functional tests', () => {
  let token = '';
  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const user = new User({
      name: 'name',
      email: 'mail@mail.com',
      password: '123456',
    });
    const newUser = await user.save();
    token = AuthService.generateToken(newUser.toJSON());
    const beach = new Beach({
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: 'E',
      user: newUser.id,
    });
    await beach.save();
  });
  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
      })
      .reply(200, stormGlassWeather3HoursFixture);
    const { body, status } = await global.testRequest
      .get('/forecast')
      .set('x-access-token', token);
    expect(status).toBe(200);
    expect(body).toEqual(apiResponseForecast3Hours);
  });

  it('should return a 500 error if something goes wrong', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
      })
      .replyWithError('Something went wrong with the stormGlass service');
    const { body, status } = await global.testRequest
      .get('/forecast')
      .set('x-access-token', token);
    expect(status).toBe(500);
    expect(body).toEqual({ error: 'Internal Server Error' });
  });
});
