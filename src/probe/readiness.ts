import { HealthCheckError } from '@godaddy/terminus';
import { inject, singleton } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { Services } from '../common/constants';

@singleton()
export class Readiness {
  public isReady = true;
  public constructor(@inject(Services.LOGGER) private readonly logger: Logger) {
    this.logger = logger;
  }

  public probe = async (): Promise<void> => {
    this.logger.debug(`readiness probe is set to ${this.isReady.toString()}.`);
    if (this.isReady) {
      return Promise.resolve();
    } else {
      throw new HealthCheckError('readiness has been terminated.', []);
    }
  };

  public kill = (): void => {
    this.logger.info(`killing service readiness.`);
    this.isReady = false;
  };

  public start = (): void => {
    this.logger.info(`starting service readiness.`);
    this.isReady = true;
  };
}
