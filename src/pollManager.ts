import { exec } from 'child_process';
import { Logger } from '@map-colonies/js-logger';
import { container, inject, singleton } from 'tsyringe';
import { Watcher } from './watcher';
import { Services } from './common/constants';
import { IConfig, IConfigProvider, IPollConfig } from './common/interfaces';

@singleton()
export class PollManager {
  private readonly config: IConfig;
  private readonly gracefulReloadMaxSeconds: number;
  private readonly msToSeconds: number;
  private readonly fifoFilePath: string;

  public constructor(
    @inject(Services.LOGGER) private readonly logger: Logger,
    @inject(Services.POLLCONFIG) private readonly pollCofig: IPollConfig,
    @inject(Services.CONFIGPROVIDER) private readonly configProvider: IConfigProvider,
    private readonly watcher: Watcher
  ) {
    this.config = container.resolve(Services.CONFIG);
    this.gracefulReloadMaxSeconds = this.config.get<number>('gracefulReloadMaxSeconds');
    this.fifoFilePath = this.config.get('uwsgiFifoFilePath');
    this.msToSeconds = 1000;
  }

  public async poll(): Promise<void> {
    const frequencyTimeOutMS = this.pollCofig.timeout.frequencyMilliseconds;

    try {
      this.logger.debug(`polling attempt`);
      if (!(await this.watcher.isUpdated())) {
        this.logger.info('changes detected, updating configurations');
        await this.configProvider.createOrUpdateConfigFile();

        const gracefulReloadRandomSeconds = Math.floor(Math.random() * this.gracefulReloadMaxSeconds);
        this.logger.info(`killing worker by graceful reload in uwsgi app within: ${gracefulReloadRandomSeconds} seconds`);
        await this.delay(gracefulReloadRandomSeconds);

        this.reloadApp();
        this.logger.info(`reload request was sent, app will be reloaded`);
      } else {
        this.logger.debug('no changes detected');
      }
    } catch (err) {
      let errMsg = '';
      if (err instanceof Error) {
        errMsg = err.message ? err.message : '';
      }
      this.logger.error({ msg: `Error occurred during poll check: ${errMsg}`, err: err });
    }
    setTimeout(() => {
      void this.poll();
    }, frequencyTimeOutMS);
  }

  public reloadApp(): void {
    this.logger.info(`send reload App Request`);
    exec(`echo r > ${this.fifoFilePath}`, (err) => {
      if (err) {
        this.logger.error({ msg: 'error occurred during app reload', err: err });
        return;
      }
    });
  }

  public async delay(seconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, seconds * this.msToSeconds));
  }
}
