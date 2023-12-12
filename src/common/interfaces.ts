/* eslint-disable @typescript-eslint/naming-convention */
export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface OpenApiConfig {
  filePath: string;
  basePath: string;
  jsonPath: string;
  uiPath: string;
}

export interface IConfigProvider {
  getLastUpdatedtime: () => Promise<Date>;
  createOrUpdateConfigFile: () => Promise<void>;
}

export interface IUpdatedTimeFileContentResult {
  updatedTime: Date;
}

export interface IPollConfig {
  timeout: {
    frequencyMilliseconds: number;
  };
}

export interface IConfigQueryResult {
  data: Record<string, unknown>;
  updated_time: Date;
}
export interface IFSConfig {
  yamlSourceFilePath: string;
}

export interface IS3Config {
  accessKeyId: string;
  secretAccessKey: string;
  endpointUrl: string;
  bucket: string;
  objectKey: string;
  sslEnabled: boolean;
}

export interface IDBConfig {
  host: string;
  user: string;
  database: string;
  schema: string;
  password: string;
  port: number;
  table: string;
  columns: IDBColumns;
  sslEnabled: boolean;
  rejectUnauthorized: boolean;
  sslPaths: {
    ca: string;
    key: string;
    cert: string;
  };
}

export interface IDBColumns {
  data: string;
  updatedTime: string;
}

export interface IUpdatedTimeFileContent {
  updatedTime: Date;
}
