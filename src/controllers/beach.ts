import { Controller, Post } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import { Error } from 'mongoose';

@Controller('beaches')
export class BeachesController {
  @Post('')
  public async createNewBeach(req: Request, res: Response): Promise<void> {
    try {
      const beachModel = new Beach(req.body);
      const beach = await beachModel.save();
      res.status(201).send(beach);
    } catch (e) {
      if (e instanceof Error.ValidationError) {
        res.status(422).send({
          error: e.message,
        });
      } else {
        res.status(500).send({
          error: 'Internal Server Error',
        });
      }
    }
  }
}
