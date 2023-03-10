import { User } from "@src/models/user";
import AuthService from "@src/services/auth";

describe('User functional tests', () => {

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('when creating a new user', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234'
      };
      const { body, status } = await global.testRequest.post('/user', ).send(newUser);
      expect(status).toBe(201);
      await expect(AuthService.comparePasswords(newUser.password, body.password)).resolves.toBeTruthy();
      expect(body).toEqual(expect.objectContaining({...newUser, password: expect.any(String)}));
    });

    it('should receive an error when creating user with invalid email', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john',
        password: '1234'
      };
      const { body, status } = await global.testRequest.post('/user', ).send(newUser);
      expect(status).toBe(422);
      expect(body).toEqual({code: 422, error: 'User validation failed: email: john is not a valid email'});
    });

    it('should receive an error if already exists user with same email', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234'
      });
      await user.save();
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234'
      };
      const { body, status } = await global.testRequest.post('/user', ).send(newUser);
      expect(status).toBe(409);
      expect(body).toEqual({code: 409, error: "E11000 duplicate key error collection: surf-forecast.users index: email_1 dup key: { email: \"john@mail.com\" }"});
    });
  });

  describe('when authenticating an user', () => {
    it('should generate a new token for a valid user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234'
      }
      await new User(newUser).save();
      const { body } = await global.testRequest.post('/user/authenticate', ).send({ email: newUser.email, password: newUser.password});
      expect(body).toEqual(
        expect.objectContaining({token: expect.any(String)})
      )
    });

    it('should return error if password is different', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234'
      }
      await new User(newUser).save();
      const { body } = await global.testRequest.post('/user/authenticate', ).send({ email: newUser.email, password: 'wrong'});
      expect(body).toEqual({code: 404, error: "Email or Password invalid"});
    });

    it('should return error if user is not found', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234'
      }
      await new User(newUser).save();
      const { body } = await global.testRequest.post('/user/authenticate', ).send({ email: 'email@mail.com', password: 'wrong'});
      expect(body).toEqual({code: 404, error: "Email or Password invalid"});
    });
  });
});
