import { Response } from 'express';
import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';
import { HTTP_CODES, RESPONSE_MESSAGES } from '@src/util/request';

export default abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(res: Response, error: unknown): void{
    if (error instanceof mongoose.Error.ValidationError){
      res.status(HTTP_CODES.VALIDATION_ERROR).send({code: HTTP_CODES.VALIDATION_ERROR, error: error.message});
    } 
    else if (error instanceof MongoServerError){
      res.status(HTTP_CODES.CONFLICT).send({code: HTTP_CODES.CONFLICT, error: error.message});
    }
    else {
      res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({code: HTTP_CODES.INTERNAL_SERVER_ERROR, error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});
    }
  }
}