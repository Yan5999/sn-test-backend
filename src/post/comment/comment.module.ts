import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentEntity } from '../../entities/comment.entity';
import { PostEntity } from '../../entities/post.entity';

import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, PostEntity])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
