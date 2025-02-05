import { Beach } from '@src/models/beach';
import { User } from '@src/models/user';
import { AuthService } from '@src/services/auth';

describe('Beach functional tests', () => {
  let token = '';
  beforeAll(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = new User({
      name: 'name',
      email: 'mail@mail.com',
      password: '123456',
    });
    const newUser = await user.save();
    token = AuthService.generateToken(newUser.toJSON());
  });
  describe('When creating a beach', () => {
    it('should create a beach successfully', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };
      const response = await global.testRequest
        .post('/beaches')
        .set('x-access-token', token)
        .send(newBeach);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });

    it('should throw 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };
      const response = await global.testRequest
        .post('/beaches')
        .set('x-access-token', token)
        .send(newBeach);
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message:
          'Beach validation failed: lat: Cast to Number failed for value \"invalid\" (type string) at path \"lat\"',
      });
    });

    it('should throw 500 when there is an unexpected error', async () => {
      jest
        .spyOn(Beach.prototype, 'save')
        .mockRejectedValueOnce('fail to create beach');
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };
      const response = await global.testRequest
        .post('/beaches')
        .set('x-access-token', token)
        .send(newBeach);
      expect(response.status).toBe(500);
    });
  });
});
