import { instanceCachingFactory, type DependencyContainer } from 'tsyringe';
import { getOtelMixin } from '@map-colonies/tracing-utils';
import { trace } from '@opentelemetry/api';
import { jsLogger } from '@map-colonies/js-logger';
import { getTracing } from '@common/tracing';
import { type InjectionObject, registerDependencies } from '@common/dependencyRegistration';
import { ConfigProvider, SERVICE_NAME, SERVICES } from './common/constants';
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

  const provider = configInstance.get('configProvider') as string;
  const fsConfig = configInstance.get(ConfigProvider.FS);
  const dbConfig = configInstance.get(ConfigProvider.DB);
  const s3Config = configInstance.get(ConfigProvider.S3);

  const dependencies: InjectionObject<unknown>[] = [
    { token: SERVICES.CONFIG, provider: { useValue: configInstance } },
    { token: SERVICES.LOGGER, provider: { useValue: logger } },
    { token: SERVICES.TRACER, provider: { useValue: tracer } },
    { token: SERVICES.FSCONFIG, provider: { useValue: fsConfig } },
    { token: SERVICES.DBCONFIG, provider: { useValue: dbConfig } },
    { token: SERVICES.S3CONFIG, provider: { useValue: s3Config } },
    {
      token: 'onSignal',
      provider: {
        useValue: async (): Promise<void> => {
          await Promise.all([getTracing().stop()]);
        },
      },
    },
    {
      token: SERVICES.CONFIGPROVIDER,
      provider: {
        useFactory: instanceCachingFactory(() => getProvider(provider)),
      },
    },
  ];

  return Promise.resolve(registerDependencies(dependencies, options?.override, options?.useChild));
};
