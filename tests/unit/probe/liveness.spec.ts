import { container } from 'tsyringe';
import { HealthCheckError } from '@godaddy/terminus';
import { registerTestValues } from '../../integration/testContainerConfig';
import { Liveness } from '../../../src/probe/liveness';

let liveness: Liveness;

describe('liveness', () => {
  beforeAll(() => {
    registerTestValues();
    liveness = container.resolve(Liveness);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('probe', () => {
    it('should successfully resovle with no error if isLive is true', async () => {
      const res = liveness.probe();
      await expect(res).resolves.not.toThrow();
    });

    it('should throw an HealthCheckError error if isLive is false', async () => {
        liveness.kill()
        const res = liveness.probe();
        await expect(res).rejects.toThrow(HealthCheckError);
      });
  });
});
