export const DEFAULT_SERVER_PORT = 80;

export const IGNORED_OUTGOING_TRACE_ROUTES = [/^.*\/v1\/metrics.*$/];
export const IGNORED_INCOMING_TRACE_ROUTES = [/^.*\/docs.*$/];

export const SERVICE_NAME = 'mapproxinator';

export enum Services {
  LOGGER = 'ILogger',
  CONFIG = 'IConfig',
  TRACER = 'TRACER',
  METER = 'METER',
  PROBE = 'PROBE',
  DBCONFIG = 'DB',
  S3CONFIG = 'S3',
  FSCONFIG = 'FS',
  CONFIGPROVIDER = 'CONFIGPROVIDER',
}
