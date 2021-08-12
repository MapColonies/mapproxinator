import { container } from 'tsyringe';
import config from 'config';
import { trace } from '@opentelemetry/api';
import { Metrics } from '@map-colonies/telemetry';
import jsLogger from '@map-colonies/js-logger';
import { Services } from '../../src/common/constants';
import { IPollConfig } from '../../src/common/interfaces';
import { getProvider } from '../../src/common/getProvider';

function registerTestValues(): void {
  const pollConfig = config.get<IPollConfig>('poll');
  const provider = config.get<string>('configProvider');
  const fsConfig = config.get(Services.FSCONFIG);
  container.register(Services.CONFIG, { useValue: config });
  container.register(Services.LOGGER, { useValue: jsLogger({ enabled: false }) });
  container.register(Services.POLLCONFIG, { useValue: pollConfig });
  container.register(Services.FSCONFIG, { useValue: fsConfig });
  // if sdk is not initialized then getTracer returns a NoopTracer
  const testTracer = trace.getTracer('testTracer');
  container.register(Services.TRACER, { useValue: testTracer });

  const metrics = new Metrics('app_meter');
  const meter = metrics.start();
  container.register(Services.METER, { useValue: meter });
  container.register(Services.CONFIGPROVIDER, {
    useValue: getProvider(provider),
  });
}

export { registerTestValues };
