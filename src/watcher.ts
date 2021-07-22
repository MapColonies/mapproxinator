/* eslint-disable @typescript-eslint/naming-convention */
import { Logger } from '@map-colonies/js-logger';
import { inject, singleton } from 'tsyringe';
import { Services } from './common/constants';
import { IConfigProvider, IFSConfig } from './common/interfaces';
import { compareDates, getFileContentAsJson } from './common/utils';

@singleton()
export class Watcher {
  public constructor(
    @inject(Services.FSCONFIG) private readonly fsConfig: IFSConfig,
    @inject(Services.CONFIGPROVIDER) private readonly configProvider: IConfigProvider,
    @inject(Services.LOGGER) private readonly logger: Logger,
  ) {}


  public async isUpdated(): Promise<boolean> {
    // gets the last updated time from the saved file
    const lastUpdatedTimeFromFile = await this.getLastUpdatedTimeFromFile();
    // gets the last updated time from provider
    const lastUpdatedTimeFromProvider = await this.getLastUpdatedTimeFromProvider();

    const isDateEquals = compareDates(lastUpdatedTimeFromFile, lastUpdatedTimeFromProvider);
    return isDateEquals;
  }

  private async getLastUpdatedTimeFromFile(): Promise<Date> {
    const updatedTimeFilePath = this.fsConfig.updatedTimeJsonFilePath;

    // gets the last updated date from the saved file
    const fileContent = await getFileContentAsJson(updatedTimeFilePath);
    // create 'Date' instance from the readed file content
    const lastUpdatedTime = new Date(fileContent.updatedTime);
    return lastUpdatedTime;
  }

  private async getLastUpdatedTimeFromProvider(): Promise<Date> {
    // gets the config content as json objcet from defined provider
    const lastUpdatedTime = await this.configProvider.getLastUpdatedtime();
    // extract the last update time field from the json object
    return lastUpdatedTime;
  }
}
