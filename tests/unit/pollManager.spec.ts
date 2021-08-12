import { container } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { registerTestValues } from '../integration/testContainerConfig';
import { PollManager } from '../../src/pollManager';
import { Watcher } from '../../src/watcher';
import { Readiness } from '../../src/probe/readiness';
import { Services } from '../../src/common/constants';
import { IConfigProvider } from '../../src/common/interfaces';

let pollManager: PollManager;
let watcher: Watcher;
let readiness: Readiness;
// eslint-disable-next-line @typescript-eslint/naming-convention
let configProvider: IConfigProvider;
let getRandomIntegerStub: jest.SpyInstance;
let isUpdatedStub: jest.SpyInstance;
let delayStub: jest.SpyInstance;
let readinessKillStub: jest.SpyInstance;
let readinessStartStub: jest.SpyInstance;
let createOrUpdateConfigFileStub: jest.SpyInstance;

describe('pollManager', () => {
  beforeAll(() => {
    registerTestValues();
    pollManager = container.resolve(PollManager);
    watcher = container.resolve(Watcher);
    readiness = container.resolve(Readiness);
    configProvider = container.resolve(Services.CONFIGPROVIDER);
  });

  beforeEach(() => {
    getRandomIntegerStub = jest.spyOn(pollManager, 'getRandomInteger');
    isUpdatedStub = jest.spyOn(watcher, 'isUpdated');
    delayStub = jest.spyOn(pollManager, 'delay').mockImplementation(async () => Promise.resolve());
    readinessKillStub = jest.spyOn(readiness, 'kill');
    readinessStartStub = jest.spyOn(readiness, 'start');
    createOrUpdateConfigFileStub = jest.spyOn(configProvider, 'createOrUpdateConfigFile').mockResolvedValue(undefined);
    jest.useFakeTimers();
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
      expect(readinessKillStub).toHaveBeenCalledTimes(0);
      expect(createOrUpdateConfigFileStub).toHaveBeenCalledTimes(0);
      expect(readinessStartStub).toHaveBeenCalledTimes(0);
    });

    it('should kill and restart readiness and not throw an error', async () => {
      // const loggerMock = ({
      //   error: jest.fn(),
      //   info: jest.fn(),
      // } as unknown) as Logger;
      getRandomIntegerStub.mockReturnValue(5);
      isUpdatedStub.mockResolvedValue(false);

      const res = pollManager.poll();
      await expect(res).resolves.not.toThrow();

      expect(isUpdatedStub).toHaveBeenCalledTimes(1);
      //expect(delayStub).toHaveBeenCalledTimes(3);
      expect(getRandomIntegerStub).toHaveBeenCalledTimes(1);
      expect(readinessKillStub).toHaveBeenCalledTimes(1);
      expect(createOrUpdateConfigFileStub).toHaveBeenCalledTimes(1);
      expect(readinessStartStub).toHaveBeenCalledTimes(1);
    });

    it('should reject and not to throw an error due to poll date error (watcher)', async () => {
      const loggerMock = ({
        error: jest.fn(),
        info: jest.fn(),
      } as unknown) as Logger;
      pollManager = new PollManager(loggerMock, container.resolve(Services.POLLCONFIG), configProvider, watcher, readiness);
      getRandomIntegerStub.mockReturnValue(5);
      isUpdatedStub.mockRejectedValue(new Error('Error1'));

      await pollManager.poll();

      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(isUpdatedStub).toHaveBeenCalledTimes(1);
      expect(delayStub).toHaveBeenCalledTimes(0);
      expect(getRandomIntegerStub).toHaveBeenCalledTimes(0);
      expect(readinessKillStub).toHaveBeenCalledTimes(0);
      expect(createOrUpdateConfigFileStub).toHaveBeenCalledTimes(0);
      expect(readinessStartStub).toHaveBeenCalledTimes(0);
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
