import { HealthCheckError } from '@godaddy/terminus';
import { container } from 'tsyringe';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Liveness } from '@src/probe/liveness';
import { registerTestValues } from '@tests/integration/testContainerConfig';

let liveness: Liveness;

describe('liveness', () => {
  beforeAll(async () => {
    await registerTestValues();
  });

  beforeEach(() => {
    liveness = container.resolve(Liveness);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('probe', () => {
    it('should successfully resovle with no error if isLive is true', async () => {
      const res = liveness.probe();

      await expect(res).resolves.not.toThrow();
    });

    it('should throw an HealthCheckError error if isLive is false', async () => {
      liveness.kill();
      const res = liveness.probe();

      await expect(res).rejects.toThrow(HealthCheckError);
    });
  });
});
