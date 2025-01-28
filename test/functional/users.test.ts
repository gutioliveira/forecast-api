describe('User functional tests', () => {
  it('should succesfully create a new user', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john@mail.com',
      password: '123456',
    };
    const response = await global.testRequest.post('/users').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining(newUser));
  });
});
