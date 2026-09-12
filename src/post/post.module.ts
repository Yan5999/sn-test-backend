import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostEntity } from '../entities/post.entity';
import { PublicFileEntity } from '../entities/public-file.entity';
import { FileModule } from '../libs/file/file.module';

import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, PublicFileEntity]),
    FileModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
