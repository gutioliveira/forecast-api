import { AuthService } from '@src/services/auth';
import { authMiddleware } from '../auth';

describe('AuthMiddleware', () => {
  it('should verify JWT token and call next middleware', () => {
    const jwt = AuthService.generateToken({ data: 'fake-data' });
    const reqFake = {
      headers: {
        'x-access-token': jwt,
      },
    };
    const resFake = {};
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(nextFake).toHaveBeenCalled();
  });
});
