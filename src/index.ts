/* eslint-disable import/first */
// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { createServer } from 'http';
import { createTerminus } from '@godaddy/terminus';
import { Logger } from '@map-colonies/js-logger';
import { container } from 'tsyringe';
import { DEFAULT_SERVER_PORT, Services } from './common/constants';
import { getApp } from './app';
import { IConfig } from './common/interfaces';
import { Readiness } from './probe/readiness';
import { PollManager } from './pollManager';
import { Liveness } from './probe/liveness';
import { Initializer } from './initializer';
import { registerExternalValues } from './containerConfig';

interface IServerConfig {
  port: string;
}

registerExternalValues();
const initializer = container.resolve(Initializer);
const logger = container.resolve<Logger>(Services.LOGGER);
const config = container.resolve<IConfig>(Services.CONFIG);
const pollManager = container.resolve(PollManager);
const initMode = config.get<boolean>('initMode');

const startServer = (): void => {
  const serverConfig = config.get<IServerConfig>('server');
  const port: number = parseInt(serverConfig.port) || DEFAULT_SERVER_PORT;
  const app = getApp();
  const healthCheck = container.resolve(Liveness).probe;
  const readyCheck = container.resolve(Readiness).probe;
  const server = createTerminus(createServer(app), {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    healthChecks: { '/liveness': healthCheck, '/readiness': readyCheck, onSignal: container.resolve('onSignal') },
  });

  server.listen(port, () => {
    logger.info(`app started on port ${port}`);
  });
};

try {
  if (initMode) {
    logger.info(`starting initMode`);
    void initializer.init();
  } else {
    logger.info(`starting Server`);
    startServer();
    logger.info(`start polling`);
    void pollManager.poll();
  }
} catch (error) {
  logger.fatal(error);
}
