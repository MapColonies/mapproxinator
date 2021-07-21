/* eslint-disable @typescript-eslint/naming-convention */
import { Logger } from '@map-colonies/js-logger';
import { inject, singleton } from 'tsyringe';
import { Services } from './common/constants';
import { IConfigProvider, IFSConfig } from './common/interfaces';
import { compareDates, getFileContentAsJson } from './common/utils';
import { Readiness } from './probe/readindess';

@singleton()
export class PullManager {
  public constructor(
    @inject(Services.FSCONFIG) private readonly fsConfig: IFSConfig,
    @inject(Services.CONFIGPROVIDER) private readonly configProvider: IConfigProvider,
    @inject(Services.LOGGER) private readonly logger: Logger,
    private readonly readiness: Readiness
  ) {}

  public async pullAndCheckForUpdate(): Promise<boolean> {
    console.log('pulling');

    // pull last updated time from the saved file
    const lastUpdatedTimeFromFile = await this.pullLastUpdatedTimeFromFile();
    // pull last updated time forom provider
    const lastUpdatedTimeFromProvider = await this.pullLastUpdatedTimeFromProvider();

    const isDateEquals = compareDates(lastUpdatedTimeFromFile, lastUpdatedTimeFromProvider);
    return isDateEquals;
  }

  private async pullLastUpdatedTimeFromFile(): Promise<Date> {
    const updatedTimeFilePath = this.fsConfig.updatedTimeFilePath;

    // gets the last updated date from the saved file
    const fileContent = await getFileContentAsJson(updatedTimeFilePath);
    // create 'Date' instance from the readed file content
    const lastUpdatedTime = new Date(fileContent.updatedTime);
    return lastUpdatedTime;
  }

  private async pullLastUpdatedTimeFromProvider(): Promise<Date> {
    // gets the config content as json objcet from defined provider
    const jsonData = await this.configProvider.provide();
    // extract the last update time field from the json object
    const lastUpdatedTime = jsonData.updated_time;
    return lastUpdatedTime;
  }
}
