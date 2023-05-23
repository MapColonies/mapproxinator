/* eslint-disable @typescript-eslint/naming-convention */
import { join, dirname } from 'path';
import { promises as fsp } from 'fs';
import S3 from 'aws-sdk/clients/s3';
import * as AWS from 'aws-sdk';
import { container } from 'tsyringe';
import { CredentialsOptions } from 'aws-sdk/lib/credentials';
import { IConfig, IConfigProvider, IS3Config } from '../interfaces';
import { Services } from '../constants';
import { createLastUpdatedTimeJsonFile } from '../utils';

export class S3Provider implements IConfigProvider {
  private readonly s3Config: IS3Config;
  private readonly config: IConfig;
  private readonly s3: S3;
  private readonly options: S3.GetObjectRequest;
  private readonly updatedTimeFileName: string;
  private readonly yamlDestinationFilePath: string;

  public constructor() {
    this.config = container.resolve(Services.CONFIG);
    this.s3Config = container.resolve(Services.S3CONFIG);
    this.updatedTimeFileName = this.config.get<string>('updatedTimeFileName');
    this.yamlDestinationFilePath = this.config.get<string>('yamlDestinationFilePath');
    const credentials: CredentialsOptions = {
      accessKeyId: this.s3Config.accessKeyId,
      secretAccessKey: this.s3Config.secretAccessKey,
    };
    const awsCredentials = new AWS.Credentials(credentials);
    const endpoint = this.s3Config.endpointUrl;
    const sslEnabled = this.s3Config.sslEnabled;
    this.s3 = new S3({
      credentials: awsCredentials,
      endpoint: endpoint,
      sslEnabled: sslEnabled,
      s3ForcePathStyle: true,
    });
    this.options = {
      Bucket: this.s3Config.bucket,
      Key: this.s3Config.objectKey,
    };
  }

  public async getLastUpdatedtime(): Promise<Date> {
    try {
      // Setting up S3 upload parameters
      const params = {
        Bucket: this.s3Config.bucket,
        Key: this.s3Config.objectKey, // File name you want to read from S3
      };
      // Reads file from the bucket
      const lastUpdatedDate = (await this.s3.getObject(params).promise()).LastModified;
      return lastUpdatedDate as Date;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async createOrUpdateConfigFile(): Promise<void> {
    const resp = await this.s3.getObject(this.options).promise();
    const updatedDate = resp.LastModified;
    const content = resp.Body as Buffer;
    const destination = this.yamlDestinationFilePath;
    const updatedTimeJsonFileDest = join(dirname(destination), this.updatedTimeFileName);

    await fsp.writeFile(destination, content);
    await createLastUpdatedTimeJsonFile(updatedTimeJsonFileDest, updatedDate as Date);
  }
}
