import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostEntity } from '../entities/post.entity';
import { PublicFileEntity } from '../entities/public-file.entity';
import { UserEntity } from '../entities/user.entity';
import { PaginationDto } from '../libs/common/dto/pagination.dto';
import { FileService } from '../libs/file/file.service';

import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  public constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(PublicFileEntity)
    private readonly fileRepository: Repository<PublicFileEntity>,
    private readonly fileService: FileService,
  ) {}

  public async create(
    authorId: string,
    dto: CreatePostDto,
    files: Express.Multer.File[],
  ) {
    const uploadedFiles = await this.fileService.uploadMany(files, 'posts');

    const post = this.postRepository.create({
      text: dto.text,
      author: { id: authorId } as UserEntity,
      files: uploadedFiles.map((file) => this.fileRepository.create(file)),
    });

    return this.postRepository.save(post);
  }

  private async attachLikedFlag(posts: PostEntity[], currentUserId?: string) {
    if (!posts.length) return;

    if (!currentUserId) {
      posts.forEach((post) => (post.isLikedByMe = false));
      return;
    }

    const rows = await this.postRepository
      .createQueryBuilder('post')
      .select('post.id', 'id')
      .innerJoin('post.likes', 'like')
      .innerJoin('like.user', 'user', 'user.id = :currentUserId', {
        currentUserId,
      })
      .where('post.id IN (:...ids)', { ids: posts.map((post) => post.id) })
      .getRawMany<{ id: string }>();

    const likedIds = new Set(rows.map((row) => row.id));

    posts.forEach((post) => (post.isLikedByMe = likedIds.has(post.id)));
  }

  public async findAll(
    { limit, offset }: PaginationDto,
    currentUserId?: string,
  ) {
    const [items, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .leftJoinAndSelect('post.files', 'files')
      .loadRelationIdAndMap('post.likeIds', 'post.likes')
      .loadRelationIdAndMap('post.commentIds', 'post.comments')
      .orderBy('post.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    items.forEach((post) => {
      post.likesCount = post.likeIds?.length ?? 0;
      post.commentsCount = post.commentIds?.length ?? 0;
    });

    await this.attachLikedFlag(items, currentUserId);

    return { items, total, limit, offset };
  }

  public async findByAuthor(
    authorId: string,
    { limit, offset }: PaginationDto,
    currentUserId?: string,
  ) {
    const [items, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .leftJoinAndSelect('post.files', 'files')
      .loadRelationIdAndMap('post.likeIds', 'post.likes')
      .loadRelationIdAndMap('post.commentIds', 'post.comments')
      .where('author.id = :authorId', { authorId })
      .orderBy('post.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    items.forEach((post) => {
      post.likesCount = post.likeIds?.length ?? 0;
      post.commentsCount = post.commentIds?.length ?? 0;
    });

    await this.attachLikedFlag(items, currentUserId);

    return { items, total, limit, offset };
  }

  public async findOne(id: string, currentUserId?: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .leftJoinAndSelect('post.files', 'files')
      .loadRelationIdAndMap('post.likeIds', 'post.likes')
      .loadRelationIdAndMap('post.commentIds', 'post.comments')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    post.likesCount = post.likeIds?.length ?? 0;
    post.commentsCount = post.commentIds?.length ?? 0;

    await this.attachLikedFlag([post], currentUserId);

    return post;
  }

  public async remove(id: string, userId: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (post.author.id !== userId) {
      throw new ForbiddenException('You can delete only your own posts.');
    }

    await Promise.all(
      post.files.map((file) => this.fileService.delete(file.key)),
    );
    await this.postRepository.remove(post);

    return true;
  }
}
