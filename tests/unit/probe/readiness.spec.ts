import { container } from 'tsyringe';
import { HealthCheckError } from '@godaddy/terminus';
import { registerTestValues } from '../../integration/testContainerConfig';
import { Readiness } from '../../../src/probe/readiness';

let readiness: Readiness;

describe('readiness', () => {
  beforeAll(() => {
    registerTestValues();
    readiness = container.resolve(Readiness);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('probe', () => {
    it('should successfully resovle with no error if isReady is true', async () => {
      const res = readiness.probe();
      await expect(res).resolves.not.toThrow();
    });

    it('should throw an HealthCheckError error if isReady is false', async () => {
        readiness.kill()
        const res = readiness.probe();
        await expect(res).rejects.toThrow(HealthCheckError);
      });
  });
});
