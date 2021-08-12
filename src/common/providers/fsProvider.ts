import { dirname, join } from 'path';
import { promises as fsp } from 'fs';
import { container } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { IConfig, IConfigProvider, IFSConfig } from '../interfaces';
import { Services } from '../constants';
import { createLastUpdatedTimeJsonFile } from '../utils';

export class FSProvider implements IConfigProvider {
  private readonly config: IConfig;
  private readonly fsConfig: IFSConfig;
  private readonly logger: Logger;
  private readonly updatedTimeFileName: string;

  public constructor() {
    this.config = container.resolve(Services.CONFIG);
    this.logger = container.resolve(Services.LOGGER);
    this.fsConfig = this.config.get<IFSConfig>(Services.FSCONFIG);
    this.updatedTimeFileName = this.config.get<string>('updatedTimeFileName');
  }

  public async getLastUpdatedtime(): Promise<Date> {
    try {
      const lastUpdatedDate = (await fsp.stat(this.fsConfig.yamlSourceFilePath)).mtime;
      return lastUpdatedDate;
    } catch (error) {
      throw new Error(error);
    }
  }

  public async createOrUpdateConfigFile(): Promise<void> {
    const source = this.fsConfig.yamlSourceFilePath;
    const updatedDate = (await fsp.stat(source)).mtime;
    const destination = this.fsConfig.yamlDestinationFilePath;
    const updatedTimeJsonFileDest = join(dirname(destination), this.updatedTimeFileName);

    await fsp.copyFile(source, destination);
    await createLastUpdatedTimeJsonFile(updatedTimeJsonFileDest, updatedDate);
  }
}
