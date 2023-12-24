import { container } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { registerTestValues } from '../integration/testContainerConfig';
import { PollManager } from '../../src/pollManager';
import { Watcher } from '../../src/watcher';
import { Services } from '../../src/common/constants';
import { IConfigProvider } from '../../src/common/interfaces';

let pollManager: PollManager;
let watcher: Watcher;
// eslint-disable-next-line @typescript-eslint/naming-convention
let configProvider: IConfigProvider;
let isUpdatedStub: jest.SpyInstance;
let reloadStub: jest.SpyInstance;
let createOrUpdateConfigFileStub: jest.SpyInstance;
let delaySpy: jest.SpyInstance;
jest.useFakeTimers();

describe('pollManager', () => {
  beforeAll(() => {
    registerTestValues();
    pollManager = container.resolve(PollManager);
    watcher = container.resolve(Watcher);
    configProvider = container.resolve(Services.CONFIGPROVIDER);
  });

  beforeEach(() => {
    isUpdatedStub = jest.spyOn(watcher, 'isUpdated');
    delaySpy = jest.spyOn(pollManager, 'delay');
    delaySpy.mockImplementation(async () => Promise.resolve());
    reloadStub = jest.spyOn(pollManager, 'reloadApp').mockImplementation(async () => Promise.resolve());
    createOrUpdateConfigFileStub = jest.spyOn(configProvider, 'createOrUpdateConfigFile').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('poll', () => {
    it('should start a poll and not throw an error', async () => {
      isUpdatedStub.mockResolvedValue(true);

      const res = pollManager.poll();
      await expect(res).resolves.not.toThrow();

      expect(isUpdatedStub).toHaveBeenCalled();
      expect(createOrUpdateConfigFileStub).toHaveBeenCalledTimes(0);
      expect(reloadStub).toHaveBeenCalledTimes(0);
    });

    it('should kill and restart readiness and not throw an error', async () => {
      isUpdatedStub.mockResolvedValue(false);

      const res = pollManager.poll();
      await expect(res).resolves.not.toThrow();
      expect(isUpdatedStub).toHaveBeenCalledTimes(1);
      expect(reloadStub).toHaveBeenCalledTimes(1);
      expect(createOrUpdateConfigFileStub).toHaveBeenCalledTimes(1);
    });

    it('should reject and not to throw an error due to poll date error (watcher)', async () => {
      const loggerMock = {
        error: jest.fn(),
        info: jest.fn(),
      } as unknown as Logger;
      pollManager = new PollManager(loggerMock, container.resolve(Services.POLLCONFIG), configProvider, watcher);
      isUpdatedStub.mockRejectedValue(new Error('Error1'));

      await pollManager.poll();

      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(isUpdatedStub).toHaveBeenCalledTimes(1);
      expect(reloadStub).toHaveBeenCalledTimes(0);
      expect(createOrUpdateConfigFileStub).toHaveBeenCalledTimes(0);
    });
  });
});
