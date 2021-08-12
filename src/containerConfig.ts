import { container } from 'tsyringe';
import config from 'config';
import { logMethod } from '@map-colonies/telemetry';
import { trace } from '@opentelemetry/api';
import jsLogger, { LoggerOptions } from '@map-colonies/js-logger';
import { Metrics } from '@map-colonies/telemetry';
import { Services } from './common/constants';
import { tracing } from './common/tracing';
import { IPollConfig } from './common/interfaces';
import { getProvider } from './common/getProvider';

function registerExternalValues(): void {
  const loggerConfig = config.get<LoggerOptions>('telemetry.logger');
  const provider = config.get<string>('configProvider');
  const pollConfig = config.get<IPollConfig>('poll');
  const fsConfig = config.get(Services.FSCONFIG);
  const dbConfig = config.get(Services.DBCONFIG);
  const s3Config = config.get(Services.S3CONFIG);
  // @ts-expect-error the signature is wrong
  const logger = jsLogger({ ...loggerConfig, prettyPrint: loggerConfig.prettyPrint, hooks: { logMethod } });
  container.register(Services.CONFIG, { useValue: config });
  container.register(Services.LOGGER, { useValue: logger });
  container.register(Services.FSCONFIG, { useValue: fsConfig });
  container.register(Services.DBCONFIG, { useValue: dbConfig });
  container.register(Services.S3CONFIG, { useValue: s3Config });
  container.register(Services.POLLCONFIG, { useValue: pollConfig });
  tracing.start();
  const tracer = trace.getTracer('app');
  container.register(Services.TRACER, { useValue: tracer });
  const metrics = new Metrics('app_meter');
  const meter = metrics.start();
  container.register(Services.METER, { useValue: meter });
  container.register('onSignal', {
    useValue: async (): Promise<void> => {
      await Promise.all([tracing.stop(), metrics.stop()]);
    },
  });
  container.register(Services.CONFIGPROVIDER, {
    useValue: getProvider(provider),
  });
}

export { registerExternalValues };
