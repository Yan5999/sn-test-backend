import { S3ClientConfig } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const getS3Config = (configService: ConfigService): S3ClientConfig => {
  return {
    region: configService.getOrThrow<string>('S3_REGION'),
    credentials: {
      accessKeyId: configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),
      secretAccessKey: configService.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
    },
  };
};
