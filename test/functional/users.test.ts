import { User } from '@src/models/user';
import { AuthService } from '@src/services/auth';

describe('User functional tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('User creation', () => {
    it('should succesfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '123456',
      };
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      expect(
        await AuthService.comparePassword(
          newUser.password,
          response.body.password
        )
      ).toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
    });

    it('should not create an user when passing an invalid email', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'email',
        password: '123456',
      };
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message: 'User validation failed: email: Email is not valid',
      });
    });

    it('should not create an user with same email', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'email@mail.com',
        password: '123456',
      };
      await new User(newUser).save();
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'Conflict',
        message: 'Email already in use',
      });
    });
  });

  describe('User Authentication', () => {
    it('should return a token when authenticating a valid user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'email@mail.com',
        password: '123456',
      };
      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({
          email: 'email@mail.com',
          password: '123456',
        });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token: expect.any(String) });
    });

    it('should return 404 when passing an invalid password', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'email@mail.com',
        password: '123456',
      };
      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({
          email: 'email@mail.com',
          password: '1234',
        });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: 404,
        error: 'Not Found',
        message: 'User or Password invalid',
      });
    });

    it('should return 404 when passing an invalid email', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'ema123il@mail.com',
        password: '123456',
      };
      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({
          email: 'email@mail.com',
          password: '1234',
        });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: 404,
        error: 'Not Found',
        message: 'User or Password invalid',
      });
    });
  });

  describe('When fetching user information', () => {
    it('should return current user when there is a user for that token', async () => {
      const user = await new User({
        name: 'John Doe',
        email: 'email@mail.com',
        password: '123456',
      }).save();
      const token = AuthService.generateToken(user.toJSON());
      const response = await global.testRequest
        .get('/users/me')
        .set('x-access-token', token);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(JSON.parse(JSON.stringify({ user })));
    });

    it('should return 404 when there is not a user for that token', async () => {
      const token = AuthService.generateToken({
        name: 'John Doe',
        email: 'email@mail.com',
        password: '123456',
      });
      const response = await global.testRequest
        .get('/users/me')
        .set('x-access-token', token);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: 404,
        error: 'Not Found',
        message: 'User not found',
      });
    });
  });
});
