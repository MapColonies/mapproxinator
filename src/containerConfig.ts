import { container } from 'tsyringe';
import { getOtelMixin } from '@map-colonies/tracing-utils';
import { trace } from '@opentelemetry/api';
import { jsLogger } from '@map-colonies/js-logger';
import { getTracing } from '@common/tracing';
import { SERVICE_NAME, Services } from './common/constants';
import { IPollConfig } from './common/interfaces';
import { getProvider } from './common/getProvider';
import { getConfig } from './common/config';

export const registerExternalValues = async (): Promise<void> => {
  const configInstance = getConfig();

  const loggerConfig = configInstance.get('telemetry.logger');

  const logger = await jsLogger({ ...loggerConfig, prettyPrint: loggerConfig.prettyPrint, mixin: getOtelMixin() });

  const tracer = trace.getTracer(SERVICE_NAME);

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
  container.register(Services.TRACER, { useValue: tracer });
  container.register('onSignal', {
    useValue: async (): Promise<void> => {
      await Promise.all([getTracing().stop()]);
    },
  });
  container.register(Services.CONFIGPROVIDER, {
    useValue: getProvider(provider),
  });
};
