import { container } from 'tsyringe';
import { registerTestValues } from '../../integration/testContainerConfig';
import { Providers } from '../../../src/common/enums';
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
    const provider = getProvider(Providers.DB, container);
    expect(provider.constructor.name).toBe(providerName);
  });

  it('should return an FS provider', () => {
    const providerName = 'FSProvider';
    const provider = getProvider(Providers.FS, container);
    expect(provider.constructor.name).toBe(providerName);
  });

  it('should return a S3 provider', () => {
    const providerName = 'S3Provider';
    const provider = getProvider(Providers.S3, container);
    expect(provider.constructor.name).toBe(providerName);
  });
});
