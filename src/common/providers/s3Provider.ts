/* eslint-disable @typescript-eslint/naming-convention */
import S3 from 'aws-sdk/clients/s3';
import * as AWS from 'aws-sdk';
import { CredentialsOptions } from 'aws-sdk/lib/credentials';
import { IConfigProvider, IS3Config } from '../interfaces';

export class S3Provider implements IConfigProvider {
  private readonly s3Config: IS3Config;
  private readonly s3: S3;

  public constructor(s3Config: IS3Config) {
    this.s3Config = s3Config;
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
    } catch (error) {
      throw new Error(error);
    }
  }
}
