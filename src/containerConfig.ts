import { container } from 'tsyringe';
import { getOtelMixin } from '@map-colonies/tracing-utils';
import { trace } from '@opentelemetry/api';
import { jsLogger } from '@map-colonies/js-logger';
import { Services } from './common/constants';
import { tracing } from './common/tracing';
import { IPollConfig } from './common/interfaces';
import { getProvider } from './common/getProvider';

export const registerExternalValues = async (): Promise<void> => {
  const configInstance = getConfig();

  const loggerConfig = configInstance.get('telemetry.logger');

  const logger = await jsLogger({ ...loggerConfig, prettyPrint: loggerConfig.prettyPrint, mixin: getOtelMixin() });

  const provider = configInstance.get<string>('configProvider');
  const pollConfig = configInstance.get<IPollConfig>('poll');
  const fsConfig = configInstance.get(Services.FSCONFIG);
  const dbConfig = configInstance.get(Services.DBCONFIG);
  const s3Config = configInstance.get(Services.S3CONFIG);

  container.register(Services.CONFIG, { useValue: configInstance });
  container.register(Services.LOGGER, { useValue: logger });
  container.register(Services.FSCONFIG, { useValue: fsConfig });
  container.register(Services.DBCONFIG, { useValue: dbConfig });
  container.register(Services.S3CONFIG, { useValue: s3Config });
  container.register(Services.POLLCONFIG, { useValue: pollConfig });
  tracing.start();
  const tracer = trace.getTracer('app');
  container.register(Services.TRACER, { useValue: tracer });
  container.register('onSignal', {
    useValue: async (): Promise<void> => {
      await Promise.all([tracing.stop()]);
    },
  });
  container.register(Services.CONFIGPROVIDER, {
    useValue: getProvider(provider),
  });
};
