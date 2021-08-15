import { container, inject, singleton } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { IConfig, IConfigProvider } from './common/interfaces';
import { Services } from './common/constants';

@singleton()
export class Initializer {
  private readonly logger: Logger;
  private readonly config: IConfig;
  public constructor(@inject(Services.CONFIGPROVIDER) private readonly configProvider: IConfigProvider) {
    this.config = container.resolve(Services.CONFIG);
    this.logger = container.resolve(Services.LOGGER);
  }

  public async init(): Promise<void> {
    try {
      this.logger.info('initializing configuration');
      await this.configProvider.createOrUpdateConfigFile();
      /* eslint-disable @typescript-eslint/naming-convention */
      const serviceProvider = String(this.config.get('configProvider')).toUpperCase();
      this.logger.info(`mapproxy configuration and upadated time files were succesfully retrieved from ${serviceProvider}`);
    } catch (error) {
      this.logger.error(`failed retrieved configuration files, error: ${(error as Error).message}`);
    }
  }
}
