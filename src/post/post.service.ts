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

  public async findAll({ limit, offset }: PaginationDto) {
    const [items, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
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

    return { items, total, limit, offset };
  }

  public async findByAuthor(
    authorId: string,
    { limit, offset }: PaginationDto,
  ) {
    const [items, total] = await this.postRepository.findAndCount({
      where: { author: { id: authorId } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { items, total, limit, offset };
  }

  public async findOne(id: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
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
