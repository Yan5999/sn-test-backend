import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'argon2';
import { Repository } from 'typeorm';

import { ProfileEntity } from '../entities/profile.entity';
import { PublicFileEntity } from '../entities/public-file.entity';
import { UserEntity } from '../entities/user.entity';
import { PaginationDto } from '../libs/common/dto/pagination.dto';
import { FileService } from '../libs/file/file.service';
import { PostService } from '../post/post.service';

import { SearchUsersDto } from './dto/search-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(PublicFileEntity)
    private readonly fileRepository: Repository<PublicFileEntity>,
    private readonly fileService: FileService,
    private readonly postService: PostService,
  ) {}

  public async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  public async findByUsername(username: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  public async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { profile: { avatar: true } },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  public async create(data: CreateUserData): Promise<UserEntity> {
    const newUser = this.userRepository.create({
      username: data.username,
      email: data.email,
      password: await hash(data.password),
      isEmailVerified: false,
      profile: new ProfileEntity(),
    });

    return await this.userRepository.save(newUser);
  }

  public async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { profile: true },
    });

    if (!user) throw new NotFoundException('User not found.');

    Object.assign(user.profile, dto);
    await this.profileRepository.save(user.profile);

    return user.profile;
  }

  public async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { profile: { avatar: true } },
    });

    if (!user) throw new NotFoundException('User not found.');

    const previousKey = user.profile.avatar?.key;
    const previousAvatarId = user.profile.avatar?.id;

    const uploaded = await this.fileService.upload(file, 'avatars');

    const avatar = await this.fileRepository.save(
      this.fileRepository.create(uploaded),
    );

    user.profile.avatar = avatar;
    await this.profileRepository.save(user.profile);

    if (previousAvatarId) {
      await this.fileRepository.delete(previousAvatarId);
    }

    if (previousKey) {
      await this.fileService.delete(previousKey);
    }

    return user.profile;
  }

  public async getPublicProfile(
    username: string,
    pagination: PaginationDto,
    currentUserId?: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: { profile: { avatar: true } },
    });

    if (!user) throw new NotFoundException('User not found.');

    const [followersCount, followingCount, posts, followedByMeCount] =
      await Promise.all([
        this.userRepository
          .createQueryBuilder('u')
          .innerJoin('u.following', 'target', 'target.id = :id', {
            id: user.id,
          })
          .getCount(),
        this.userRepository
          .createQueryBuilder('u')
          .innerJoin('u.followers', 'source', 'source.id = :id', {
            id: user.id,
          })
          .getCount(),
        this.postService.findByAuthor(user.id, pagination, currentUserId),
        currentUserId
          ? this.userRepository
              .createQueryBuilder('u')
              .innerJoin('u.followers', 'f', 'f.id = :followerId', {
                followerId: currentUserId,
              })
              .where('u.id = :targetId', { targetId: user.id })
              .getCount()
          : Promise.resolve(0),
      ]);

    return {
      user,
      followersCount,
      followingCount,
      posts,
      isFollowedByMe: followedByMeCount > 0,
    };
  }

  public async search({ query, limit, offset }: SearchUsersDto) {
    const [items, total] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .where('user.username ILIKE :query', { query: `%${query}%` })
      .orWhere('profile.firstName ILIKE :query', { query: `%${query}%` })
      .orWhere('profile.lastName ILIKE :query', { query: `%${query}%` })
      .orderBy('user.username', 'ASC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items, total, limit, offset };
  }

  public async follow(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot follow yourself.');
    }

    const target = await this.userRepository.countBy({ id: targetUserId });
    if (!target) throw new NotFoundException('User not found.');

    const alreadyFollowing = await this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.followers', 'f', 'f.id = :followerId', {
        followerId: currentUserId,
      })
      .where('u.id = :targetId', { targetId: targetUserId })
      .getCount();

    if (alreadyFollowing) {
      throw new ConflictException('You are already following this user.');
    }
    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'followers')
      .of(targetUserId)
      .add(currentUserId);

    return true;
  }

  public async unfollow(currentUserId: string, targetUserId: string) {
    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'followers')
      .of(targetUserId)
      .remove(currentUserId);

    return true;
  }
}
