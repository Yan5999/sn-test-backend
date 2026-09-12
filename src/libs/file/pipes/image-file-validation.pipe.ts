import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE } from '../file.constants';

@Injectable()
export class ImageFileValidationPipe implements PipeTransform<
  Express.Multer.File,
  Express.Multer.File
> {
  public transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}.`);
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `Image must be at most ${MAX_IMAGE_SIZE / 1024 / 1024} MB.`,
      );
    }

    return file;
  }
}
