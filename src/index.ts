import config from 'config';
import logger from './logger';
import { SetupServer } from './server';

enum ExitStatus {
  Failure = 1,
  Success = 0,
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
  );
  // lets throw the error and let the uncaughtException handle below handle it
  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.error(`App exiting due to an uncaught exception: ${error}`);
  process.exit(ExitStatus.Failure);
});

(async () => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.forEach((signal: NodeJS.Signals) => {
      process.on(signal, async () => {
        try {
          await server.close();
          logger.info('App exited with success');
          process.exit(ExitStatus.Success);
        } catch (e) {
          logger.error(`App exited with error: ${e}`);
          process.exit(ExitStatus.Failure);
        }
      });
    });
  } catch (e) {
    logger.error(e)
    process.exit(ExitStatus.Failure);
  }
})();
