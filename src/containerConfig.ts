import type { DependencyContainer } from 'tsyringe';
import { getOtelMixin } from '@map-colonies/tracing-utils';
import { trace } from '@opentelemetry/api';
import { jsLogger } from '@map-colonies/js-logger';
import { getTracing } from '@common/tracing';
import { type InjectionObject, registerDependencies } from '@common/dependencyRegistration';
import { SERVICE_NAME, Services } from './common/constants';
import { IPollConfig } from './common/interfaces';
import { getProvider } from './common/getProvider';
import { getConfig } from './common/config';

export interface RegisterOptions {
  override?: InjectionObject<unknown>[];
  useChild?: boolean;
}

export const registerExternalValues = async (options?: RegisterOptions): Promise<DependencyContainer> => {
  const configInstance = getConfig();

  const loggerConfig = configInstance.get('telemetry.logger');

  const logger = await jsLogger({ ...loggerConfig, prettyPrint: loggerConfig.prettyPrint, mixin: getOtelMixin() });

  const tracer = trace.getTracer(SERVICE_NAME);

  const provider = configInstance.get<string>('configProvider');
  const pollConfig = configInstance.get<IPollConfig>('poll');
  const fsConfig = configInstance.get(Services.FSCONFIG);
  const dbConfig = configInstance.get(Services.DBCONFIG);
  const s3Config = configInstance.get(Services.S3CONFIG);

  const dependencies: InjectionObject<unknown>[] = [
    { token: Services.CONFIG, provider: { useValue: configInstance } },
    { token: Services.LOGGER, provider: { useValue: logger } },
    { token: Services.TRACER, provider: { useValue: tracer } },
    { token: Services.FSCONFIG, provider: { useValue: fsConfig } },
    { token: Services.DBCONFIG, provider: { useValue: dbConfig } },
    { token: Services.S3CONFIG, provider: { useValue: s3Config } },
    { token: Services.POLLCONFIG, provider: { useValue: pollConfig } },
    {
      token: 'onSignal',
      provider: {
        useValue: async (): Promise<void> => {
          await Promise.all([getTracing().stop()]);
        },
      },
    },
    {
      token: Services.CONFIGPROVIDER,
      provider: {
        useValue: getProvider(provider),
      },
    },
  ];

  return Promise.resolve(registerDependencies(dependencies, options?.override, options?.useChild));
};
