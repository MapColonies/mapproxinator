import { ConfigProvider } from '@src/common/constants';
import { registerTestValues } from '../../integration/testContainerConfig';
import { getProvider } from '../../../src/common/getProvider';

jest.mock('../../../src/common/providers/fsProvider');
jest.mock('../../../src/common/providers/s3Provider');
jest.mock('../../../src/common/providers/dbProvider');

describe('getProvider', () => {
  beforeEach(() => {
    registerTestValues();
    jest.clearAllMocks();
  });

  it('should return a DB provider', () => {
    const providerName = 'DBProvider';
    const provider = getProvider(ConfigProvider.DB);
    expect(provider.constructor.name).toBe(providerName);
  });

  it('should return an FS provider', () => {
    const providerName = 'FSProvider';
    const provider = getProvider(ConfigProvider.FS);
    expect(provider.constructor.name).toBe(providerName);
  });

  it('should return a S3 provider', () => {
    const providerName = 'S3Provider';
    const provider = getProvider(ConfigProvider.S3);
    expect(provider.constructor.name).toBe(providerName);
  });
});
