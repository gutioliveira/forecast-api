import { Server } from '@overnightjs/core';
import '../module-alias';
import bodyParser from 'body-parser';
import { ForecastController } from './controllers/forecast';
import { Application } from 'express';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
    this.init();
  }

  public init(): void {
    this.setupExpress();
    this.setupControllers();
  }

  public start(): void {
    this.app.listen(this.port, `Server listening at ${this.port}`);
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    this.addControllers([forecastController]);
  }
}
