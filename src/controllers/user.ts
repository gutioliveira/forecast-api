import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { comparePasswords } from '@src/util/auth';
import { HTTP_CODES, RESPONSE_MESSAGES } from '@src/util/request';
import { Request, Response } from 'express';
import BaseController from './base';

@Controller('user')
export class UserController extends BaseController {
  @Post('')
  public async createNewUser(req: Request, res: Response): Promise<void> {
    const user = new User(req.body);
    try {
      await user.save();
      res.status(HTTP_CODES.CREATED).send(user);
    } catch(error){
      this.sendCreatedUpdateErrorResponse(res, error);
    }
  }

  @Post('authenticate')
  public async authenticateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findOne({email: req.body.email});
      const password = user?.password || '';
      if (await comparePasswords(req.body.password, password)){
        res.status(HTTP_CODES.OK).send({token: 'token'});
      } else {
        res.status(HTTP_CODES.NOT_FOUND).send({code: HTTP_CODES.NOT_FOUND, error: RESPONSE_MESSAGES.EMAIL_PASSWORD_WRONG});
      }
    } catch(error){
      this.sendCreatedUpdateErrorResponse(res, error);
    }
  }
}
