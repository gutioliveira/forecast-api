import { SetupServer } from './server';

(async () => {
  const server = new SetupServer();
  await server.init();
  server.start();
})();
