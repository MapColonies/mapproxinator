import { Logger } from '@map-colonies/js-logger';
import { $ } from 'zx';
import { container, inject, singleton } from 'tsyringe';
import { Watcher } from './watcher';
import { Services } from './common/constants';
import { IConfig, IConfigProvider, IPollConfig } from './common/interfaces';

@singleton()
export class PollManager {
  private readonly config: IConfig;
  private readonly gracefulReloadMaxSeconds: number;

  public constructor(
    @inject(Services.LOGGER) private readonly logger: Logger,
    @inject(Services.POLLCONFIG) private readonly pollCofig: IPollConfig,
    @inject(Services.CONFIGPROVIDER) private readonly configProvider: IConfigProvider,
    private readonly watcher: Watcher
  ) {
    this.config = container.resolve(Services.CONFIG);
    this.gracefulReloadMaxSeconds = this.config.get<number>('gracefulReloadMaxSeconds');
  }

  public async poll(): Promise<void> {
    const frequencyTimeOutMS = this.pollCofig.timeout.frequencyMilliseconds;

    try {
      this.logger.info(`polling attempt`);
      if (!(await this.watcher.isUpdated())) {
        this.logger.debug('changes detected!');

        this.logger.info('updating configurations');
        await this.configProvider.createOrUpdateConfigFile();

        const gracefulReloadRandomSeconds = Math.floor(Math.random() * this.gracefulReloadMaxSeconds);
        this.logger.info(`killing worker by graceful reload in uwsgi app within: ${gracefulReloadRandomSeconds} seconds`);
        await this.delay(gracefulReloadRandomSeconds);

        await this.reloadApp();
        this.logger.info(`reload request was sent, app will be reloaded`);
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

  public async reloadApp(): Promise<void> {
    const fifoFilePath = this.config.get('uwsgiFifoFilePath');
    await $`echo r > ${fifoFilePath}`;
  }

  public async delay(seconds: number): Promise<void> {
    const msToSeconds = 1000;
    await new Promise((resolve) => setTimeout(resolve, seconds * msToSeconds));
  }
}
