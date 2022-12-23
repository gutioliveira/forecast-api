import './util/module-alias';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import bodyParser from 'body-parser';
import { ForecastController } from './controllers/forecast';
import * as database from '@src/database';
import { BeachController } from './controllers/beach';

export class SetupServer extends Server {
  /*
   * same as this.port = port, declaring as private here will
   * add the port variable to the SetupServer instance
   */
  constructor(private port = 3000) {
    super();
  }

  /*
   * We use a different method to init instead of using the constructor
   * this way we allow the server to be used in tests and normal initialization
   */
  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.setupDatabase();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.setupControllers();
  }

  private async setupDatabase(): Promise<void> {
    return await database.connect();
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachController = new BeachController();
    this.addControllers([forecastController, beachController]);
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.info(`Server listening to port: ${this.port}`);
    });
  }

  public async close(): Promise<void> {
    await database.close();
  }
}
