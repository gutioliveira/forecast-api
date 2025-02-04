import logger from '@src/logger';
import { AuthService } from '@src/services/auth';
import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

export function authMiddleware(
  req: Partial<Request>,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = req.headers?.['x-access-token'] as string;
    const tokenDecoded = AuthService.decodeToken(token);
    req.decoded = tokenDecoded;
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      res.status(401).send({ code: 401, error: e.message });
      return;
    }
    logger.error(e);
    res.status(500).send({ code: 500, error: 'Internal Server Error' });
  }
  next();
}
