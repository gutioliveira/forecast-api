import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';
import { BaseController } from '@src/controllers';
import { AuthService } from '@src/services/auth';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async createNewUser(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (e) {
      this.sendCreatedErrorResponse(res, e);
    }
  }

  @Post('authenticate')
  public async authenticateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findOne({
        email: req.body.email,
      });
      if (
        user &&
        (await AuthService.comparePassword(req.body.password, user.password))
      ) {
        res.status(200).send({
          token: AuthService.generateToken(user.toJSON()),
        });
      } else {
        this.sendErrorResponse(res, {
          code: 404,
          message: 'User or Password invalid',
        });
      }
    } catch (e) {
      this.sendCreatedErrorResponse(res, e);
    }
  }
}
