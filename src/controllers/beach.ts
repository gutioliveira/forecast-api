import { Controller, Post } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller('beach')
export class BeachController {
  @Post('')
  public async createNewBeach(req: Request, res: Response): Promise<void> {
    const beach = new Beach(req.body);
    try {
      await beach.save();
      res.status(201).send(beach);
    } catch(e){
      if (e instanceof mongoose.Error.ValidationError){
        res.status(422).send({error: e.message})
      } else {
        res.status(500).send({error: 'Internal Server Error'});
      }
    }
  }
}
