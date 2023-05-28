import { dirname, join } from 'path';
import { promises as fsp } from 'fs';
import { container } from 'tsyringe';
import { IConfig, IConfigProvider, IFSConfig } from '../interfaces';
import { Services } from '../constants';
import { createLastUpdatedTimeJsonFile } from '../utils';

export class FSProvider implements IConfigProvider {
  private readonly config: IConfig;
  private readonly fsConfig: IFSConfig;
  private readonly updatedTimeFileName: string;
  private readonly yamlDestinationFilePath: string;
  public constructor() {
    this.config = container.resolve(Services.CONFIG);
    this.fsConfig = this.config.get<IFSConfig>(Services.FSCONFIG);
    this.updatedTimeFileName = this.config.get<string>('updatedTimeFileName');
    this.yamlDestinationFilePath = this.config.get<string>('yamlDestinationFilePath');
  }

  public async getLastUpdatedtime(): Promise<Date> {
    try {
      const lastUpdatedDate = (await fsp.stat(this.fsConfig.yamlSourceFilePath)).mtime;
      return lastUpdatedDate;
    } catch (error) {
      let message
      if (error instanceof Error) message = error.message
      else message = String(error)
      throw new Error(message);
    }
  }

  public async createOrUpdateConfigFile(): Promise<void> {
    const source = this.fsConfig.yamlSourceFilePath;
    const updatedDate = (await fsp.stat(source)).mtime;
    const destination = this.yamlDestinationFilePath;
    const updatedTimeJsonFileDest = join(dirname(destination), this.updatedTimeFileName);

    await fsp.copyFile(source, destination);
    await createLastUpdatedTimeJsonFile(updatedTimeJsonFileDest, updatedDate);
  }
}
