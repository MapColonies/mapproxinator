import { IConfig } from 'config';
import { DependencyContainer } from 'tsyringe';
import { DBProvider } from './common/providers/dbProvider';
//import { FSProvider } from './common/providers/fSProvider';
//import { S3Provider } from './common/providers/s3Provider';
import { IConfigProvider, IDBConfig } from './common/interfaces';
import { Services } from './common/constants';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const getProvider = (provider: string, container: DependencyContainer): IConfigProvider => {
  const config = container.resolve<IConfig>(Services.CONFIG);
  const dbConfig = config.get<IDBConfig>(Services.DBCONFIG);

  //const s3Config = container.resolve(Services.S3CONFIG);
  switch (provider.toLowerCase()) {
    case 'fs':
      // return new FSProvider();
      return new DBProvider(dbConfig);
    case 's3':
      //return new S3Provider();
      return new DBProvider(dbConfig);
    case 'db':
      return new DBProvider(dbConfig);
    default:
      throw new Error(`Invalid config provider received: ${provider} - available values:  "fs", "s3" or "db"`);
  }
};
