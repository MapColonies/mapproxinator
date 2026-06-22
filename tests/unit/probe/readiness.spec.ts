import { HealthCheckError } from '@godaddy/terminus';
import { container } from 'tsyringe';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Readiness } from '@src/probe/readiness';
import { registerTestValues } from '@tests/integration/testContainerConfig';

let readiness: Readiness;

describe('readiness', () => {
  beforeAll(async () => {
    await registerTestValues();
  });

  beforeEach(() => {
    readiness = container.resolve(Readiness);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('probe', () => {
    it('should successfully resovle with no error if isReady is true', async () => {
      const res = readiness.probe();

      await expect(res).resolves.not.toThrow();
    });

    it('should throw an HealthCheckError error if isReady is false', async () => {
      readiness.kill();
      const res = readiness.probe();

      await expect(res).rejects.toThrow(HealthCheckError);
    });
  });
});
