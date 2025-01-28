import { SetupServer } from '@src/server';

(async () => {
  const server = new SetupServer();
  await server.init();
  server.start();
})();
