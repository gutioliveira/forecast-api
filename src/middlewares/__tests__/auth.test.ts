import AuthService from "@src/services/auth";
import { authMiddleware } from "../auth";

describe('AuthMiddleware', () => {
  it('should verify the JWT and call the next middleware', () => {
    const token = AuthService.generateToken({data: 'fake-data'});
    const req = {
      headers: {
        'x-access-token': token
      }
    };
    const res = {};
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED if there is a problem on the token verification', () => {
    const req = {
      headers: {
        'x-access-token': 'invalidToken'
      }
    };
    const sendMock = jest.fn();
    const res = {
      status: jest.fn(() => ({
        send: sendMock
      }))
    };
    const next = jest.fn();
    authMiddleware(req, res as object, next);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      message: 'jwt malformed'
    })
  });
});