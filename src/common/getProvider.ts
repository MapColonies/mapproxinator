import { ConfigProvider } from './constants';
import type { IConfigProvider } from './interfaces';
import { DBProvider } from './providers/dbProvider';
import { FSProvider } from './providers/fsProvider';
import { S3Provider } from './providers/s3Provider';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const getProvider = (provider: string): IConfigProvider => {
  switch (provider.toLowerCase()) {
    case ConfigProvider.FS:
      return new FSProvider();
    case ConfigProvider.S3:
      return new S3Provider();
    case ConfigProvider.DB:
      return new DBProvider();
    default:
      throw new Error(`Invalid config provider received: ${provider} - available values:  "fs", "s3" or "db"`);
  }
};
