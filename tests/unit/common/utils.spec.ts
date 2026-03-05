import * as utils from '../../../src/common/utils';

describe('utils', () => {
  describe('#getFileContentAsJson', () => {
    it('should successfully convert file content to json object', async function () {
      const jsonFilePath = 'tests/unit/mock/updated_time.json';
      const expectedResult = {
        updatedTime: '2021-07-22T10:12:20.933Z',
      };
      // action
      const lastUpdatedTime = await utils.getFileContentAsJson(jsonFilePath);
      // expectation
      expect(typeof lastUpdatedTime).toBe('object');
      expect(lastUpdatedTime).toEqual(expectedResult);
    });
  });

  describe('#compareDates', () => {
    it('should return true due equal dates', function () {
      const date1 = new Date('2021-07-22T10:12:20.933Z');
      const date2 = new Date('2021-07-22T10:12:20.933Z');
      // action
      const result = utils.compareDates(date1, date2);
      // expectation
      expect(result).toBe(true);
    });

    it('should return false due to unequal dates', function () {
      const date1 = new Date('2019-06-21T09:11:50.651Z');
      const date2 = new Date('2021-07-22T10:12:20.933Z');
      // action
      const result = utils.compareDates(date1, date2);
      // expectation
      expect(result).toBe(false);
    });
  });

  describe('#convertJsonToYaml', () => {
    it('should convert a simple json object to yaml', function () {
      const json = { key: 'value', number: 42 };
      const result = utils.convertJsonToYaml(json);
      expect(result).toContain('key: value');
      expect(result).toContain('number: 42');
    });

    it('should not quote YAML 1.1 boolean-like string values (noCompatMode)', function () {
      // In YAML 1.1 compat mode, values like "yes"/"no"/"on"/"off" would be quoted.
      // With noCompatMode: true they are emitted without quotes.
      const json: Record<string, unknown> = { enabled: 'yes', disabled: 'no', toggle: 'on', flag: 'off' };
      const result = utils.convertJsonToYaml(json);
      expect(result).toContain('enabled: yes');
      expect(result).toContain('disabled: no');
      expect(result).toContain('toggle: on');
      expect(result).toContain('flag: off');
      // Ensure none of the boolean-like string values are quoted
      expect(result).not.toMatch(/enabled:\s+['"]yes['"]/);
      expect(result).not.toMatch(/disabled:\s+['"]no['"]/);
      expect(result).not.toMatch(/toggle:\s+['"]on['"]/);
      expect(result).not.toMatch(/flag:\s+['"]off['"]/);
    });

    it('should strip quotes from numeric string keys', function () {
      // js-yaml quotes numeric string keys (e.g. '123': value).
      // The regex should remove those quotes so they appear as bare numbers.
      const json: Record<string, unknown> = { '123': 'alpha', '456': 'beta' };
      const result = utils.convertJsonToYaml(json);
      expect(result).toContain('123: alpha');
      expect(result).toContain('456: beta');
      expect(result).not.toMatch(/['"]\d+['"]\s*:/);
    });

    it('should strip quotes from nested numeric string keys', function () {
      const json: Record<string, unknown> = { nested: { '99': 'deep' } };
      const result = utils.convertJsonToYaml(json);
      expect(result).toContain('99: deep');
      expect(result).not.toMatch(/['"]99['"]\s*:/);
    });
  });
});
