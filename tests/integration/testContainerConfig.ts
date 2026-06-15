import { jsLogger } from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import { container } from 'tsyringe';
import { getConfig } from '../../src/common/config';
import { ConfigProvider, SERVICES } from '../../src/common/constants';
import { getProvider } from '../../src/common/getProvider';

export const registerTestValues = async (): Promise<void> => {
  const configInstance = getConfig();
  const logger = await jsLogger({ enabled: false });
  const testTracer = trace.getTracer('testTracer');
  const provider = configInstance.get('configProvider') as string;
  const fsConfig = configInstance.get(ConfigProvider.FS);
  container.register(SERVICES.CONFIG, { useValue: configInstance });
  container.register(SERVICES.LOGGER, { useValue: logger });
  // if sdk is not initialized then getTracer returns a NoopTracer
  container.register(SERVICES.TRACER, { useValue: testTracer });
  container.register(SERVICES.FSCONFIG, { useValue: fsConfig });
  container.register(SERVICES.CONFIGPROVIDER, {
    useValue: getProvider(provider),
  });
};
