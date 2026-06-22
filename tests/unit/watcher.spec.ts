import { container } from 'tsyringe';
import { afterEach, beforeAll, describe, expect, it, vi, type Mock } from 'vitest';
import { Watcher } from '@src/watcher';
import { registerTestValues } from '@tests/integration/testContainerConfig';

let watcher: Watcher;
let getLastUpdatedTimeFromProviderMock: Mock;

describe('watcher', () => {
  beforeAll(async () => {
    await registerTestValues();
    watcher = container.resolve(Watcher);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isUpdated', () => {
    it('should return true if both dates are equals and updated', async () => {
      getLastUpdatedTimeFromProviderMock = vi.fn();
      (
        watcher as unknown as {
          getLastUpdatedTimeFromProvider: () => Promise<Date>;
        }
      ).getLastUpdatedTimeFromProvider = getLastUpdatedTimeFromProviderMock;
      getLastUpdatedTimeFromProviderMock.mockResolvedValue(new Date('2021-07-22T10:12:20.933Z'));

      const result = await watcher.isUpdated();

      expect(result).toBe(true);
    });

    it('should return false if dates are not equals and updated', async () => {
      getLastUpdatedTimeFromProviderMock = vi.fn();
      (
        watcher as unknown as {
          getLastUpdatedTimeFromProvider: () => Promise<Date>;
        }
      ).getLastUpdatedTimeFromProvider = getLastUpdatedTimeFromProviderMock;
      getLastUpdatedTimeFromProviderMock.mockResolvedValue(new Date('2015-11-25:10:25.931Z'));

      const result = await watcher.isUpdated();

      expect(result).toBe(false);
    });
  });
});
