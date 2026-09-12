import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_FILES_PER_POST,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '../file.constants';

@Injectable()
export class MediaFilesValidationPipe implements PipeTransform<
  Express.Multer.File[],
  Express.Multer.File[]
> {
  public transform(files: Express.Multer.File[]): Express.Multer.File[] {
    if (!files?.length) {
      return [];
    }

    if (files.length > MAX_FILES_PER_POST) {
      throw new BadRequestException(
        `You can attach up to ${MAX_FILES_PER_POST} files per post.`,
      );
    }

    for (const file of files) {
      const isImage = ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype);
      const isVideo = ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype);

      if (!isImage && !isVideo) {
        throw new BadRequestException(
          `Unsupported file type: ${file.mimetype}.`,
        );
      }

      const limit = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

      if (file.size > limit) {
        throw new BadRequestException(
          `${file.originalname} is too large. Max size for ${
            isImage ? 'images' : 'videos'
          } is ${limit / 1024 / 1024} MB.`,
        );
      }
    }

    return files;
  }
}
