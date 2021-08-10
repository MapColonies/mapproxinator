import { promises as fsp } from 'fs';
import { IUpdatedTimeFileContentResult } from './interfaces';

export const getFileContentAsJson = async (filePath: string): Promise<IUpdatedTimeFileContentResult> => {
  const content = await fsp.readFile(filePath, { encoding: 'utf8' });
  const jsonFileContentResult = JSON.parse(content) as IUpdatedTimeFileContentResult;
  return jsonFileContentResult;
};

export const compareDates = (date1: Date, date2: Date): boolean => {
  return date1.getTime() === date2.getTime() ? true : false;
};
