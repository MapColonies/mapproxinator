/* eslint-disable import/first */
// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { createServer } from 'http';
import { createTerminus } from '@godaddy/terminus';
import { Logger } from '@map-colonies/js-logger';
import { container } from 'tsyringe';
import { get } from 'config';
import { DEFAULT_SERVER_PORT, Services } from './common/constants';
import { getApp } from './app';
import { Readiness } from './probe/readiness';
import { PollManager } from './pollManager';
import { Liveness } from './probe/liveness';
import { Initializer } from './initializer';

interface IServerConfig {
  port: string;
}

const serverConfig = get<IServerConfig>('server');
const initMode = get<boolean>('initMode');
const port: number = parseInt(serverConfig.port) || DEFAULT_SERVER_PORT;

const app = getApp();
const logger = container.resolve<Logger>(Services.LOGGER);
const pollManager = container.resolve(PollManager);
const initializer = container.resolve(Initializer);
const healthCheck = container.resolve(Liveness).probe;
const readyCheck = container.resolve(Readiness).probe;
const server = createTerminus(createServer(app), {
  healthChecks: { '/liveness': healthCheck, '/readiness': readyCheck, onSignal: container.resolve('onSignal') },
});
server.listen(port, () => {
  logger.info(`app started on port ${port}`);
});

try {
  if (initMode) {
    void initializer.init();
  } else {
    void pollManager.poll();
  }
} catch (error) {
  logger.fatal(error);
}
