import type { Logger } from '@map-colonies/js-logger';
import { container } from 'tsyringe';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { SERVICES } from '@src/common/constants';
import type { IConfigProvider } from '@src/common/interfaces';
import { PollManager } from '@src/pollManager';
import { Watcher } from '@src/watcher';
import { registerTestValues } from '@tests/integration/testContainerConfig';

let pollManager: PollManager;
let watcher: Watcher;
// eslint-disable-next-line @typescript-eslint/naming-convention
let configProvider: IConfigProvider;
let isUpdatedStub: Mock;
let reloadStub: Mock;
let createOrUpdateConfigFileStub: Mock;
let delaySpy: Mock;

describe('pollManager', () => {
  beforeAll(async () => {
    await registerTestValues();
    pollManager = container.resolve(PollManager);
    watcher = container.resolve(Watcher);
    configProvider = container.resolve(SERVICES.CONFIGPROVIDER);
  });

  beforeEach(() => {
    isUpdatedStub = vi.spyOn(watcher, 'isUpdated');
    delaySpy = vi.spyOn(pollManager, 'delay');
    delaySpy.mockImplementation(async () => Promise.resolve());
    reloadStub = vi.spyOn(pollManager, 'reloadApp').mockReturnValue(undefined);
    createOrUpdateConfigFileStub = vi.spyOn(configProvider, 'createOrUpdateConfigFile').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
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
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
      } as unknown as Logger;
      pollManager = new PollManager(loggerMock, container.resolve(SERVICES.CONFIG), configProvider, watcher);
      isUpdatedStub.mockRejectedValue(new Error('Error1'));

      await pollManager.poll();

      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(isUpdatedStub).toHaveBeenCalledTimes(1);
      expect(reloadStub).toHaveBeenCalledTimes(0);
      expect(createOrUpdateConfigFileStub).toHaveBeenCalledTimes(0);
    });
  });
});
