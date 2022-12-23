import { User } from "@src/models/user";

describe('User functional tests', () => {

  beforeAll(async () => {
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
      expect(body).toEqual(expect.objectContaining(newUser));
    });
  });
});
