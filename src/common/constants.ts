import { readPackageJsonSync } from '@map-colonies/read-pkg';

export const SERVICE_NAME = readPackageJsonSync().name ?? 'unknown_service';
export const DEFAULT_SERVER_PORT = 80;

export const IGNORED_OUTGOING_TRACE_ROUTES = [/^.*\/v1\/metrics.*$/];
export const IGNORED_INCOMING_TRACE_ROUTES = [/^.*\/docs.*$/];

export enum Services {
  LOGGER = 'ILogger',
  CONFIG = 'IConfig',
  TRACER = 'TRACER',
  PROBE = 'PROBE',
  DBCONFIG = 'DB',
  S3CONFIG = 'S3',
  FSCONFIG = 'FS',
  CONFIGPROVIDER = 'CONFIGPROVIDER',
}

/* eslint-disable @typescript-eslint/naming-convention */
export const ConfigProvider = {
  FS: 'fs',
  S3: 's3',
  DB: 'db',
};
/* eslint-enable @typescript-eslint/naming-convention */
