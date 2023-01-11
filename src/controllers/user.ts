import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { HTTP_CODES } from '@src/util/request';
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
}
