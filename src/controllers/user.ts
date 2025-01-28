import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  @Post('')
  public async createNewUser(req: Request, res: Response): Promise<void> {
    res.status(201).send(req.body);
  }
}
