import { dirname, join } from 'path';
import { promises as fsp, readFileSync } from 'fs';
import { Pool, PoolClient, PoolConfig } from 'pg';
import { container } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { Services } from '../constants';
import { IConfigProvider, IDBConfig, IConfigQueryResult, IConfig } from '../interfaces';
import { convertJsonToYaml, createLastUpdatedTimeJsonFile } from '../utils';

export class DBProvider implements IConfigProvider {
  private readonly dbConfig: IDBConfig;
  private readonly config: IConfig;
  private readonly pool: Pool;
  private readonly logger: Logger;
  private readonly updatedTimeFileName: string;
  private readonly yamlDestinationFilePath: string;

  public constructor() {
    this.dbConfig = container.resolve(Services.DBCONFIG);
    this.config = container.resolve(Services.CONFIG);
    this.logger = container.resolve(Services.LOGGER);
    this.updatedTimeFileName = this.config.get<string>('updatedTimeFileName');
    this.yamlDestinationFilePath = this.config.get<string>('yamlDestinationFilePath');

    const pgClientConfig: PoolConfig = {
      host: this.dbConfig.host,
      user: this.dbConfig.user,
      database: this.dbConfig.database,
      password: this.dbConfig.password ? this.dbConfig.password : undefined,
      port: this.dbConfig.port,
    };
    if (this.dbConfig.sslEnabled) {
      pgClientConfig.ssl = {
        rejectUnauthorized: this.dbConfig.rejectUnauthorized,
        key: readFileSync(this.dbConfig.sslPaths.key),
        cert: readFileSync(this.dbConfig.sslPaths.cert),
        ca: readFileSync(this.dbConfig.sslPaths.ca),
      };
    }
    this.pool = new Pool(pgClientConfig);
    this.pool.on('error', (err) => {
      const errMsg = err.message ? err.message : 'unknown db-connection error';
      this.logger.error({ msg: `Failed established connection to db with error: ${errMsg}`, err: err });
    });
  }

  public async getLastUpdatedtime(): Promise<Date> {
    const client = await this.connectToDb();
    try {
      const query = `SELECT ${this.dbConfig.columns.updatedTime} FROM ${this.dbConfig.table} ORDER BY ${this.dbConfig.columns.updatedTime} DESC limit 1`;
      const result = await client.query<IConfigQueryResult>(query);
      const lastUpdatedTime = result.rows[0].updated_time;
      return lastUpdatedTime;
    } catch (err) {
      this.logger.error({ msg: 'Failed to get last updated time', err });
      throw err;
    } finally {
      client.release();
    }
  }

  public async createOrUpdateConfigFile(): Promise<void> {
    const pgClient = await this.connectToDb();
    try {
      const query = `SELECT * FROM ${this.dbConfig.table} ORDER BY ${this.dbConfig.columns.updatedTime} DESC limit 1`;
      const queryResult = await pgClient.query<IConfigQueryResult>(query);
      const jsonContent = queryResult.rows[0].data;
      const updatedTime = queryResult.rows[0].updated_time;
      const yamlContent = convertJsonToYaml(jsonContent);
      const destination = this.yamlDestinationFilePath;
      const updatedTimeJsonFileDest = join(dirname(destination), this.updatedTimeFileName);

      await fsp.writeFile(destination, yamlContent);
      await createLastUpdatedTimeJsonFile(updatedTimeJsonFileDest, updatedTime);
    } catch (err) {
      this.logger.error({ msg: 'Failed to create or update config file', err });
      throw err;
    } finally {
      pgClient.release();
    }
  }

  private async connectToDb(): Promise<PoolClient> {
    const pgClient = await this.pool.connect();
    await pgClient.query(`SET search_path TO "${this.dbConfig.schema}",public`);
    return pgClient;
  }
}
