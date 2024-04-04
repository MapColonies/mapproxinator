import { promises as fsp } from 'fs';
import { dump } from 'js-yaml';
import { IUpdatedTimeFileContent, IUpdatedTimeFileContentResult } from './interfaces';

export const getFileContentAsJson = async (filePath: string): Promise<IUpdatedTimeFileContentResult> => {
  const content = await fsp.readFile(filePath, { encoding: 'utf8' });
  const jsonFileContentResult = JSON.parse(content) as IUpdatedTimeFileContentResult;
  return jsonFileContentResult;
};

export const compareDates = (date1: Date, date2: Date): boolean => {
  return date1.getTime() === date2.getTime() ? true : false;
};

export const createLastUpdatedTimeJsonFile = async (dest: string, timestamp: Date): Promise<void> => {
  const latUpdatedTimeJsonContent: IUpdatedTimeFileContent = {
    updatedTime: timestamp,
  };

  await fsp.writeFile(dest, JSON.stringify(latUpdatedTimeJsonContent), {});
};

// read json object and convert it into a yaml content
export function convertJsonToYaml(json: Record<string, unknown>): string {
  try {
    const yamlContent: string = dump(json, { noArrayIndent: true });
    return yamlContent;
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(message);
  }
}
