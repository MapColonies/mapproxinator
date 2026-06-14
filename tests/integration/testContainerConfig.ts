import { jsLogger } from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import { container } from 'tsyringe';
import { getConfig } from '../../src/common/config';
import { Services } from '../../src/common/constants';
import { getProvider } from '../../src/common/getProvider';
import type { IPollConfig } from '../../src/common/interfaces';

export const registerTestValues = async (): Promise<void> => {
  const configInstance = getConfig();
  const logger = await jsLogger({ enabled: false });
  const pollConfig = configInstance.get<IPollConfig>('poll');
  const provider = configInstance.get<string>('configProvider');
  const fsConfig = configInstance.get(Services.FSCONFIG);
  container.register(Services.CONFIG, { useValue: configInstance });
  container.register(Services.LOGGER, { useValue: logger });
  container.register(Services.POLLCONFIG, { useValue: pollConfig });
  container.register(Services.FSCONFIG, { useValue: fsConfig });
  // if sdk is not initialized then getTracer returns a NoopTracer
  const testTracer = trace.getTracer('testTracer');
  container.register(Services.TRACER, { useValue: testTracer });

  container.register(Services.CONFIGPROVIDER, {
    useValue: getProvider(provider),
  });
};
