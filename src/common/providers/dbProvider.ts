import { Pool, PoolConfig } from 'pg';
import { IConfigProvider, IDBConfig } from '../interfaces';

export class DBProvider implements IConfigProvider {
  private readonly dbConfig: IDBConfig;
  private readonly pool: Pool;
  public constructor(dbConfig: IDBConfig) {
    this.dbConfig = dbConfig;
    const pgClientConfig: PoolConfig = {
      host: this.dbConfig.host,
      user: this.dbConfig.user,
      database: this.dbConfig.database,
      password: this.dbConfig.password,
      port: this.dbConfig.port,
    };
    this.pool = new Pool(pgClientConfig);
  }

  public async getLastUpdatedtime(): Promise<Date> {
    const client = await this.pool.connect();
    try {
      const query = `SELECT ${this.dbConfig.columns.updatedTime} FROM ${this.dbConfig.table} ORDER BY ${this.dbConfig.columns.updatedTime} DESC limit 1`;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const result = await client.query<{updated_time: Date}>(query);
      const lastUpdatedTime = result.rows[0].updated_time;
      return lastUpdatedTime;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Failed to provied json from database: ${error}`);
    } finally {
      client.release();
    }
  }
}
