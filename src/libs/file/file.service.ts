import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { getS3Config } from '../../config/s3.config';

import { UploadedFileResult } from './file.types';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cdnDomain: string;

  public constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client(getS3Config(configService));
    this.bucket = configService.getOrThrow<string>('S3_BUCKET');
    this.cdnDomain = configService.getOrThrow<string>('CDN_DOMAIN');
  }

  public async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadedFileResult> {
    const key = `${folder}/${uuidv4()}${extname(file.originalname).toLowerCase()}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to upload ${key}`, error);
      throw new InternalServerErrorException('Failed to upload file.');
    }

    return {
      key,
      url: `https://${this.cdnDomain}/${key}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  public async uploadMany(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadedFileResult[]> {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }

  public async delete(key: string) {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete ${key}`, error);
    }
  }
}
