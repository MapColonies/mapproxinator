import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '@src/common/constants';
import { getProvider } from '@src/common/getProvider';
import { DBProvider } from '@src/common/providers/dbProvider';
import { FSProvider } from '@src/common/providers/fsProvider';
import { S3Provider } from '@src/common/providers/s3Provider';
import { registerTestValues } from '@tests/integration/testContainerConfig';

vi.mock('../../../src/common/providers/fsProvider');
vi.mock('../../../src/common/providers/s3Provider');
vi.mock('../../../src/common/providers/dbProvider');

describe('getProvider', () => {
  beforeEach(async () => {
    await registerTestValues();
    vi.clearAllMocks();
  });

  it('should return a DB provider', () => {
    const provider = getProvider(ConfigProvider.DB);

    expect(provider).toBeInstanceOf(DBProvider);
  });

  it('should return a FS provider', () => {
    const provider = getProvider(ConfigProvider.FS);

    expect(provider).toBeInstanceOf(FSProvider);
  });

  it('should return a S3 provider', () => {
    const provider = getProvider(ConfigProvider.S3);

    expect(provider).toBeInstanceOf(S3Provider);
  });
});
