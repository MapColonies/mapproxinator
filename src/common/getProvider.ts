import { IConfig } from 'config';
import { DependencyContainer } from 'tsyringe';
import { DBProvider } from './providers/dbProvider';
import { IConfigProvider, IDBConfig, IFSConfig, IS3Config } from './interfaces';
import { Services } from './constants';
import { S3Provider } from './providers/s3Provider';
import { FSProvider } from './providers/fsProvider';
import { Providers } from './enums';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const getProvider = (provider: string, container: DependencyContainer): IConfigProvider => {
  const config = container.resolve<IConfig>(Services.CONFIG);
  const fsConfig = config.get<IFSConfig>(Services.FSCONFIG);
  const s3Config = config.get<IS3Config>(Services.S3CONFIG);
  const dbConfig = config.get<IDBConfig>(Services.DBCONFIG);

  switch (provider.toLowerCase()) {
    case Providers.FS:
      return new FSProvider(fsConfig);
    case Providers.S3:
      return new S3Provider(s3Config);
    case Providers.DB:
      return new DBProvider(dbConfig);
    default:
      throw new Error(`Invalid config provider received: ${provider} - available values:  "fs", "s3" or "db"`);
  }
};
