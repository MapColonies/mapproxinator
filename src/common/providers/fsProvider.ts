import { dirname, join } from 'node:path';
import { promises as fsp } from 'node:fs';
import { container } from 'tsyringe';
import type { IConfig, IConfigProvider, IFSConfig } from '../interfaces';
import { SERVICES } from '../constants';
import { createLastUpdatedTimeJsonFile } from '../utils';

export class FSProvider implements IConfigProvider {
  private readonly config: IConfig;
  private readonly fsConfig: IFSConfig;
  private readonly updatedTimeFileName: string;
  private readonly yamlDestinationFilePath: string;
  public constructor() {
    this.config = container.resolve(SERVICES.CONFIG);
    this.fsConfig = container.resolve(SERVICES.FSCONFIG);
    this.updatedTimeFileName = this.config.get<string>('updatedTimeFileName');
    this.yamlDestinationFilePath = this.config.get<string>('yamlDestinationFilePath');
  }

  public async getLastUpdatedtime(): Promise<Date> {
    try {
      const lastUpdatedDate = (await fsp.stat(this.fsConfig.yamlSourceFilePath)).mtime;
      return lastUpdatedDate;
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
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
