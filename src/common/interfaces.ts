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
  provide: () => Promise<IQueryResult>;
}

export interface IQueryResult {
  id?: number;
  data: Record<string, unknown>;
  updated_time: Date;
}

export interface IUpdatedTimeFileContentResult {
  updatedTime: Date;
}

export interface IFSConfig {
  updatedTimeFilePath: string;
}

export interface IDBConfig {
  host: string;
  user: string;
  database: string;
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
