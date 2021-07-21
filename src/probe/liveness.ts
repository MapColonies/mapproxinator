import { HealthCheckError } from '@godaddy/terminus';
import { inject, singleton } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { Services } from '../common/constants';

@singleton()
export class Liveness {
  public isLive = true;
  public constructor(@inject(Services.LOGGER) private readonly logger: Logger) {
    this.logger = logger;
  }

  public probe = async (): Promise<void> => {
    this.logger.debug(`liveness probe is set to ${this.isLive.toString()}.`);
    if (this.isLive) {
      return Promise.resolve();
    } else {
      // throw new HealthCheckError('Error', 'Readiness has been terminated');
      throw new HealthCheckError('liveness has been terminated.', []);
    }
  };

  public kill = (): void => {
    this.logger.debug(`killing service liveness.`);
    this.isLive = false;
  };
}
