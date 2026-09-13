import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentEntity } from '../../entities/comment.entity';
import { PostEntity } from '../../entities/post.entity';
import { UserEntity } from '../../entities/user.entity';
import { PaginationDto } from '../../libs/common/dto/pagination.dto';

import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  public constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  public async create(postId: string, userId: string, dto: CreateCommentDto) {
    const postExists = await this.postRepository.countBy({ id: postId });

    if (!postExists) {
      throw new NotFoundException('Post not found.');
    }

    return this.commentRepository.save(
      this.commentRepository.create({
        text: dto.text,
        post: { id: postId } as PostEntity,
        author: { id: userId } as UserEntity,
      }),
    );
  }

  public async findByPost(postId: string, { limit, offset }: PaginationDto) {
    const [items, total] = await this.commentRepository.findAndCount({
      where: { post: { id: postId } },
      relations: { author: { profile: { avatar: true } } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { items, total, limit, offset };
  }

  public async remove(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: { author: true, post: { author: true } },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    const isCommentAuthor = comment.author.id === userId;
    const isPostAuthor = comment.post.author.id === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      throw new ForbiddenException(
        'You can delete only your own comments or comments under your posts.',
      );
    }

    await this.commentRepository.remove(comment);

    return true;
  }
}
