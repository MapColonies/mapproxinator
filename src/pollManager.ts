import { Logger } from '@map-colonies/js-logger';
import { inject, singleton } from 'tsyringe';
import { Watcher } from './watcher';
import { Readiness } from './probe/readiness';
import { Services } from './common/constants';
import { IConfigProvider, IPollConfig } from './common/interfaces';

@singleton()
export class PollManager {
  public constructor(
    @inject(Services.LOGGER) private readonly logger: Logger,
    @inject(Services.POLLCONFIG) private readonly pollCofig: IPollConfig,
    @inject(Services.CONFIGPROVIDER) private readonly configProvider: IConfigProvider,
    private readonly watcher: Watcher,
    private readonly readiness: Readiness
  ) {}

  public async poll(): Promise<void> {
    const frequencyTimeOutMS = this.pollCofig.timeout.frequencyMilliseconds;
    const requestsKillSeconds = this.pollCofig.timeout.requestsKillSeconds;
    const afterUpdateDelaySeconds = this.pollCofig.timeout.afterUpdateDelaySeconds;

    try {
      this.logger.info(`polling attempt`);
      if (!(await this.watcher.isUpdated())) {
        this.logger.debug('changes detected!');
        const readinessKillRndInt = this.getRandomInteger();
        this.logger.info(`killing readiness in ${readinessKillRndInt} seconds`);
        await this.delay(readinessKillRndInt);
        this.readiness.kill();
        this.logger.info(`killing existing requests in ${requestsKillSeconds}`);
        await this.delay(requestsKillSeconds);
        this.logger.info('updating configurations');
        await this.configProvider.createOrUpdateConfigFile();
        // make sure mapproxy start updating before restart readiness
        await this.delay(afterUpdateDelaySeconds);
        this.readiness.start();
      } else {
        this.logger.debug('no changes detected');
      }
    } catch (error) {
      if (error instanceof Error) {
        const stackMessage = error.stack !== undefined ? error.stack : '';
        this.logger.error(`Error occurred during poll check: ${error.message}, stack: ${stackMessage}`);
      }
    }
    setTimeout(() => {
      void this.poll();
    }, frequencyTimeOutMS);
  }

  public async delay(seconds: number): Promise<void> {
    const msToSeconds = 1000;
    await new Promise((resolve) => setTimeout(resolve, seconds * msToSeconds));
  }

  public getRandomInteger(): number {
    const maxRandomSeconds = this.pollCofig.timeout.readinessKillMaxRandomSeconds;
    const randomInt = Math.floor(Math.random() * maxRandomSeconds);
    return randomInt;
  }
}
