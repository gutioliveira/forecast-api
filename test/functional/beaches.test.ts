import { Beach } from "@src/models/beach";
import { User } from "@src/models/user";
import AuthService from "@src/services/auth";

describe('Beach functional tests', () => {

  let token = '';

  beforeAll(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const newUser = {
      name: 'John Doe',
      email: 'john@mail.com',
      password: '1234'
    };
    const user = await (new User(newUser)).save();
    token = AuthService.generateToken(user.toJSON());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when creating a new beach', () => {
    it('should return a beach', async () => {
      const newBeach = {
        name: 'Name',
        position: 'S',
        lat: 10.00,
        lng: 10.00,
      };
      const { body, status } = await global.testRequest.post('/beach', ).set({'x-access-token': token}).send(newBeach);
      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newBeach));
    });

    it('should throw 422 when there is a validation error', async () => {
      const newBeach = {
        name: 'Name',
        position: 'S',
        lat: 'invalid value',
        lng: 10.00,
      };
      const { body, status } = await global.testRequest.post('/beach', ).set({'x-access-token': token}).send(newBeach);
      expect(status).toBe(422);
      expect(body).toEqual({code: 422, error: 'Beach validation failed: lat: Cast to Number failed for value "invalid value" (type string) at path "lat"'});
    });

    it('should throw 500 when there is an unexpected error', async () => {
      const newBeach = {
        name: 'Name',
        position: 'S',
        lat: 10.00,
        lng: 10.00,
      };
      jest.spyOn(Beach.prototype, 'save')
        .mockImplementationOnce(() => Promise.reject('Fails'))
      const { body, status } = await global.testRequest.post('/beach', ).set({'x-access-token': token}).send(newBeach);
      expect(status).toBe(500);
      expect(body).toEqual({code: 500, error: 'Internal Server Error'});
    });
  });
});
