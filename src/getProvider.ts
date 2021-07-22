import { IConfig } from 'config';
import { DependencyContainer } from 'tsyringe';
import { DBProvider } from './common/providers/dbProvider';
//import { FSProvider } from './common/providers/fSProvider';
//import { S3Provider } from './common/providers/s3Provider';
import { IConfigProvider, IDBConfig, IFSConfig, IS3Config } from './common/interfaces';
import { Services } from './common/constants';
import { S3Provider } from './common/providers/s3Provider';
import { FSProvider } from './common/providers/fsProvider';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const getProvider = (provider: string, container: DependencyContainer): IConfigProvider => {
  const config = container.resolve<IConfig>(Services.CONFIG);
  const fsConfig = config.get<IFSConfig>(Services.FSCONFIG);
  const s3Config = config.get<IS3Config>(Services.S3CONFIG);
  const dbConfig = config.get<IDBConfig>(Services.DBCONFIG);

  //const s3Config = container.resolve(Services.S3CONFIG);
  switch (provider.toLowerCase()) {
    case 'fs':
      // return new FSProvider();
      return new FSProvider(fsConfig);
    case 's3':
      //return new S3Provider();
      return new S3Provider(s3Config);
    case 'db':
      return new DBProvider(dbConfig);
    default:
      throw new Error(`Invalid config provider received: ${provider} - available values:  "fs", "s3" or "db"`);
  }
};
