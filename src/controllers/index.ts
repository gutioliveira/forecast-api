import { Response } from 'express';
import { Error, MongooseError } from 'mongoose';

export abstract class BaseController {
  protected sendResponseError(res: Response, error: unknown): void {
    if (error instanceof Error.ValidationError) {
      res.status(422).send({ code: 422, error: error.message });
    } else if (error instanceof MongooseError) {
      res.status(409).send({ code: 409, error: error.message });
    } else {
      res.status(500).send({ code: 500, error: 'Something went wrong' });
    }
  }
}
