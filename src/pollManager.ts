import { Logger } from '@map-colonies/js-logger';
import { inject, singleton } from 'tsyringe';
import { Watcher } from './watcher';
import { Readiness } from './probe/readiness';
import { Liveness } from './probe/liveness';
import { Services } from './common/constants';
import { IPollConfig } from './common/interfaces';

@singleton()
export class PollManager {
  public constructor(
    @inject(Services.LOGGER) private readonly logger: Logger,
    @inject(Services.POLLCONFIG) private readonly pollCofig: IPollConfig,
    private readonly watcher: Watcher,
    private readonly liveness: Liveness,
    private readonly readiness: Readiness
  ) {}

  public async poll(): Promise<void> {
    const frequencyTimeOutMS = this.pollCofig.timeout.frequencyMilliseconds;
    const livenessKillTimeOutMS = this.pollCofig.timeout.livenessKillSeconds;
    try {
      this.logger.info(`polling attempt`);
      if (!(await this.watcher.isUpdated())) {
        this.logger.info('changes detected! - updating configurations');
        await this.delay(this.getRandomInteger());
        this.readiness.kill();
        await this.delay(livenessKillTimeOutMS);
        this.liveness.kill();
      } else {
        this.logger.info('no changes detected');
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

  public async delay(ms: number): Promise<void> {
    const msToSeconds = 1000;
    await new Promise((resolve) => setTimeout(resolve, ms * msToSeconds));
  }

  public getRandomInteger(): number {
    const maxRandomSeconds = this.pollCofig.timeout.readinessKillMaxRandomSeconds;
    const randomInt = Math.floor(Math.random() * maxRandomSeconds);
    return randomInt;
  }
}
