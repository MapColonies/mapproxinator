import { promises as fsp } from 'fs';
import { IConfigProvider, IFSConfig } from '../interfaces';

export class FSProvider implements IConfigProvider {
  private readonly fsConfig: IFSConfig;

  public constructor(fsConfig: IFSConfig) {
    this.fsConfig = fsConfig;
  }

  public async getLastUpdatedtime(): Promise<Date> {
    try {
      const lastUpdatedDate = (await fsp.stat(this.fsConfig.yamlFilePath)).mtime;
      return lastUpdatedDate;
    } catch (error) {
      throw new Error(error);
    }
  }
}
