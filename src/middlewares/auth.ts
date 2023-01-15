import AuthService from "@src/services/auth";
import { HTTP_CODES, RESPONSE_MESSAGES } from "@src/util/request";
import { NextFunction, Request, Response } from "express";

export function authMiddleware(req: Partial<Request>, res: Partial<Response>, next: NextFunction){
  try {
    const token = req.headers?.['x-access-token'];
  const decoded = AuthService.decodeToken(token as string);
  req.decoded = decoded;
  next();
  } catch(e){
    if (e instanceof Error){
      res.status?.(HTTP_CODES.UNAUTHORIZED).send({code: HTTP_CODES.UNAUTHORIZED, message: e.message})
    } else {
      res.status?.(HTTP_CODES.INTERNAL_SERVER_ERROR).send({code: HTTP_CODES.INTERNAL_SERVER_ERROR, message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR})
    }
  }
}