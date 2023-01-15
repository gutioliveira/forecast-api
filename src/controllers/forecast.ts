import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import { HTTP_CODES } from '@src/util/request';
import { Request, Response } from 'express';
import BaseController from './base';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  @Get('')
  public async getForecastForgeLoggedUser(req: Request, res: Response): Promise<void> {
    try {
      const beaches = await Beach.find({user: req.decoded?.id});
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(HTTP_CODES.OK).send(forecastData);
    } catch(e){
      this.sendCreatedUpdateErrorResponse(res, e);
    }
  }
}
