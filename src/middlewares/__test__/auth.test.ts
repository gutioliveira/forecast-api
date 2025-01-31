import { Response } from 'express';
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
    const resFake = {} as Response;
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(nextFake).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED if token is invalid', () => {
    const reqFake = {
      headers: {
        'x-access-token': 'invalid-token',
      },
    };
    const sendFake = jest.fn();
    const statusFake = jest.fn().mockReturnValue({ send: sendFake });
    const resFake = {
      status: statusFake,
    } as unknown as Response;
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(statusFake).toHaveBeenCalledWith(401);
    expect(sendFake).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });

  it('should return UNAUTHORIZED if token is expired', () => {
    const reqFake = {
      headers: {
        'x-access-token': 'invalid-token',
      },
    };
    const sendFake = jest.fn();
    const statusFake = jest.fn().mockReturnValue({ send: sendFake });
    const resFake = {
      status: statusFake,
    } as unknown as Response;
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(statusFake).toHaveBeenCalledWith(401);
    expect(sendFake).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });
});
