import { DBProvider } from './providers/dbProvider';
import { IConfigProvider } from './interfaces';
import { S3Provider } from './providers/s3Provider';
import { FSProvider } from './providers/fsProvider';
import { Providers } from './enums';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const getProvider = (provider: string): IConfigProvider => {
  switch (provider.toLowerCase()) {
    case Providers.FS:
      return new FSProvider();
    case Providers.S3:
      return new S3Provider();
    case Providers.DB:
      return new DBProvider();
    default:
      throw new Error(`Invalid config provider received: ${provider} - available values:  "fs", "s3" or "db"`);
  }
};
