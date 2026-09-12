import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LikeEntity } from '../../entities/like.entity';
import { PostEntity } from '../../entities/post.entity';

import { LikeController } from './like.controller';
import { LikeService } from './like.service';

@Module({
  imports: [TypeOrmModule.forFeature([LikeEntity, PostEntity])],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
