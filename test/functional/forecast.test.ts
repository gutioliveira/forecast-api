import { Beach, BeachPosition } from "@src/models/beach";
import stormGlassWeather3HoursFixture from '../fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1Beach from '../fixtures/forecast_response_1_beach.json';
import nock from 'nock';
import { User } from "@src/models/user";
import AuthService from "@src/services/auth";

describe('Beach forecast functional tests', () => {

  let token = '';

  beforeEach(async () => {
    await User.deleteMany({});
    await Beach.deleteMany({});
    const newUser = {
      name: 'John Doe',
      email: 'john@mail.com',
      password: '1234'
    };
    const user = await (new User(newUser)).save();
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: BeachPosition.E,
      user: user.id,
    };
    token = AuthService.generateToken(user.toJSON());
    const beach = new Beach(defaultBeach);
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
    const { body, status } = await global.testRequest.get('/forecast').set({'x-access-token': token});
    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1Beach);
  });

  it('Should return error 500 if something goes wrong', async () => {
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
      .replyWithError('Something Went Wrong');
    const { status } = await global.testRequest.get('/forecast').set({'x-access-token': token});
    expect(status).toBe(500);
  });
});
