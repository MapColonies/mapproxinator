/* eslint-disable import/first */
// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { createServer } from 'http';
import { Tracing } from '@map-colonies/telemetry';
import { createTerminus } from '@godaddy/terminus';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { Logger } from '@map-colonies/js-logger';
import { container } from 'tsyringe';
import { get } from 'config';
import { DEFAULT_SERVER_PORT, IGNORED_INCOMING_TRACE_ROUTES, IGNORED_OUTGOING_TRACE_ROUTES, Services } from './common/constants';

const tracing = new Tracing([
  new HttpInstrumentation({ ignoreOutgoingUrls: IGNORED_OUTGOING_TRACE_ROUTES, ignoreIncomingPaths: IGNORED_INCOMING_TRACE_ROUTES }),
  new ExpressInstrumentation(),
]);

import { getApp } from './app';
import { Readiness } from './probe/readindess';
import { PollManager } from './pollManager';
import { Liveness } from './probe/liveness';

interface IServerConfig {
  port: string;
}

const serverConfig = get<IServerConfig>('server');
const port: number = parseInt(serverConfig.port) || DEFAULT_SERVER_PORT;

const app = getApp();

const logger = container.resolve<Logger>(Services.LOGGER);
const pollManager = container.resolve(PollManager);

const healthCheck = container.resolve(Liveness).probe;
const readyCheck = container.resolve(Readiness).probe;
const server = createTerminus(createServer(app), {
  healthChecks: { '/liveness': healthCheck, '/readiness': readyCheck, onSignal: container.resolve('onSignal') },
});

server.listen(port, () => {
  logger.info(`app started on port ${port}`);
});

void pollManager.poll().catch((error: Error) => {
  logger.fatal(error); 
});
