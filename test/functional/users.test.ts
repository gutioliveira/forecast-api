import { User } from '@src/models/user';
import { AuthService } from '@src/services/auth';

describe('User functional tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
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
      error: 'User validation failed: email: Email is not valid',
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
      error: 'Email already in use',
    });
  });
});
