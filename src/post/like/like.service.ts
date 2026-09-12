import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeEntity } from '../../entities/like.entity';
import { PostEntity } from '../../entities/post.entity';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class LikeService {
  public constructor(
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  public async like(postId: string, userId: string) {
    const postExists = await this.postRepository.countBy({ id: postId });

    if (!postExists) {
      throw new NotFoundException('Post not found.');
    }

    const alreadyLiked = await this.likeRepository.countBy({
      post: { id: postId },
      user: { id: userId },
    });

    if (alreadyLiked) {
      throw new ConflictException('You have already liked this post.');
    }

    await this.likeRepository.save(
      this.likeRepository.create({
        post: { id: postId } as PostEntity,
        user: { id: userId } as UserEntity,
      }),
    );

    return true;
  }

  public async unlike(postId: string, userId: string) {
    const result = await this.likeRepository.delete({
      post: { id: postId },
      user: { id: userId },
    });

    if (!result.affected) {
      throw new NotFoundException('Like not found.');
    }

    return true;
  }
}
