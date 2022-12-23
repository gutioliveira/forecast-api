import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller('user')
export class UserController {
  @Post('')
  public async createNewUser(req: Request, res: Response): Promise<void> {
    const user = new User(req.body);
    try {
      await user.save();
      res.status(201).send(user);
    } catch(e){
      if (e instanceof mongoose.Error.ValidationError){
        res.status(422).send({error: e.message})
      } else {
        res.status(500).send({error: 'Internal Server Error'});
      }
    }
  }
}
