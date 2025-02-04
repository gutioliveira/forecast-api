import logger from '@src/logger';
import ApiError, { APIError } from '@src/util/error/api-error';
import { Response } from 'express';
import { Error, MongooseError } from 'mongoose';

export abstract class BaseController {
  protected sendCreatedErrorResponse(res: Response, error: unknown): void {
    if (error instanceof Error.ValidationError) {
      res
        .status(422)
        .send(ApiError.format({ code: 422, message: error.message }));
    } else if (error instanceof MongooseError) {
      res
        .status(409)
        .send(ApiError.format({ code: 409, message: error.message }));
    } else {
      logger.error(error);
      res
        .status(500)
        .send(ApiError.format({ code: 500, message: 'Something went wrong' }));
    }
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
