import { AuthService } from '@src/services/auth';
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Partial<Request>,
  _: Partial<Response>,
  next: NextFunction
): void {
  const token = req.headers?.['x-access-token'] as string;
  const tokenDecoded = AuthService.decodeToken(token);
  req.decoded = tokenDecoded;
  next();
}
