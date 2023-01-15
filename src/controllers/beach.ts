import { Controller, ClassMiddleware, Post } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { HTTP_CODES } from '@src/util/request';
import { Request, Response } from 'express';
import BaseController from './base';

@Controller('beach')
@ClassMiddleware(authMiddleware)
export class BeachController extends BaseController {
  @Post('')
  public async createNewBeach(req: Request, res: Response): Promise<void> {
    const beach = new Beach({...req.body, ...{user: req.decoded?.id}});
    try {
      await beach.save();
      res.status(HTTP_CODES.CREATED).send(beach);
    } catch(e){
      this.sendCreatedUpdateErrorResponse(res, e);
    }
  }
}
