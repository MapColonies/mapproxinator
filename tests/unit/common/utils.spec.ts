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
});
