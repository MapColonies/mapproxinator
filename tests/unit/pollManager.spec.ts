import { container } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { registerTestValues } from '../integration/testContainerConfig';
import { PollManager } from '../../src/pollManager';
import { Watcher } from '../../src/watcher';
import { Liveness } from '../../src/probe/liveness';
import { Readiness } from '../../src/probe/readiness';
import { Services } from '../../src/common/constants';

let pollManager: PollManager;
let watcher: Watcher;
let liveness: Liveness;
let readiness: Readiness;
let getRandomIntegerStub: jest.SpyInstance;
let isUpdatedStub: jest.SpyInstance;
let delayStub: jest.SpyInstance;
let livenessKillStub: jest.SpyInstance;
let readinessKillStub: jest.SpyInstance;

describe('pollManager', () => {
  beforeAll(() => {
    registerTestValues();
    pollManager = container.resolve(PollManager);
    watcher = container.resolve(Watcher);
    liveness = container.resolve(Liveness);
    readiness = container.resolve(Readiness);
  });

  beforeEach(() => {
    getRandomIntegerStub = jest.spyOn(pollManager, 'getRandomInteger');
    isUpdatedStub = jest.spyOn(watcher, 'isUpdated');
    delayStub = jest.spyOn(pollManager, 'delay').mockImplementation(async () => Promise.resolve());
    livenessKillStub = jest.spyOn(liveness, 'kill');
    readinessKillStub = jest.spyOn(readiness, 'kill');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('poll', () => {
    it('should start a poll and not throw an error', async () => {
      getRandomIntegerStub.mockReturnValue(5);
      isUpdatedStub.mockResolvedValue(true);

      const res = pollManager.poll();
      await expect(res).resolves.not.toThrow();

      expect(isUpdatedStub).toHaveBeenCalled();
      expect(delayStub).toHaveBeenCalledTimes(0);
      expect(getRandomIntegerStub).toHaveBeenCalledTimes(0);
      expect(livenessKillStub).toHaveBeenCalledTimes(0);
      expect(readinessKillStub).toHaveBeenCalledTimes(0);
    });

    it('should kill liveness and readiness and not throw an error', async () => {
      getRandomIntegerStub.mockReturnValue(5);
      isUpdatedStub.mockResolvedValue(false);

      const res = pollManager.poll();
      await expect(res).resolves.not.toThrow();

      expect(isUpdatedStub).toHaveBeenCalledTimes(1);
      expect(delayStub).toHaveBeenCalledTimes(2);
      expect(getRandomIntegerStub).toHaveBeenCalledTimes(1);
      expect(livenessKillStub).toHaveBeenCalledTimes(1);
      expect(readinessKillStub).toHaveBeenCalledTimes(1);
    });

    it('should reject and not to throw an error due to poll date error (watcher)', async () => {
      const loggerMock = ({
        error: jest.fn(),
      } as unknown) as Logger;
      pollManager = new PollManager(loggerMock, container.resolve(Services.POLLCONFIG), watcher, liveness, readiness);
      getRandomIntegerStub.mockReturnValue(5);
      isUpdatedStub.mockRejectedValue(new Error('Error1'));

      const res = pollManager.poll();
      await expect(res).resolves.not.toThrow();

      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(isUpdatedStub).toHaveBeenCalledTimes(1);
      expect(delayStub).toHaveBeenCalledTimes(0);
      expect(getRandomIntegerStub).toHaveBeenCalledTimes(0);
      expect(livenessKillStub).toHaveBeenCalledTimes(0);
      expect(readinessKillStub).toHaveBeenCalledTimes(0);
    });

    describe('getRandomInteger', () => {
      it('should return random integer', () => {
        const randomInt = pollManager.getRandomInteger();

        expect(typeof randomInt).toBe('number');
        expect(randomInt).toBeLessThanOrEqual(1);
      });
    });
  });
});
