import pino from 'pino';
import config, { IConfig } from 'config';

const pinoConfig: IConfig = config.get('App.logger');

export default pino({
  enabled: pinoConfig.get('enabled'),
  level: pinoConfig.get('level')
})