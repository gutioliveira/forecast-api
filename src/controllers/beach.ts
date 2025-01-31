import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import { BaseController } from '@src/controllers';
import { authMiddleware } from '@src/middlewares/auth';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  @Post('')
  public async createNewBeach(req: Request, res: Response): Promise<void> {
    try {
      const beachModel = new Beach(req.body);
      const beach = await beachModel.save();
      res.status(201).send(beach);
    } catch (e) {
      this.sendResponseError(res, e);
    }
  }
}
