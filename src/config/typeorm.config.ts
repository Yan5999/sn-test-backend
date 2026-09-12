import { ConfigService } from '@nestjs/config';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { CommentEntity } from '../entities/comment.entity';
import { LikeEntity } from '../entities/like.entity';
import { PostEntity } from '../entities/post.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { PublicFileEntity } from '../entities/public-file.entity';
import { UserEntity } from '../entities/user.entity';
import { IS_DEV_ENV } from '../libs/common/utils/is-dev-util';

export async function getTypeOrmConfig(
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> {
  return {
    type: 'postgres',
    namingStrategy: new SnakeNamingStrategy(),
    host: configService.getOrThrow<string>('POSTGRES_HOST'),
    port: configService.getOrThrow<number>('POSTGRES_PORT'),
    username: configService.getOrThrow<string>('POSTGRES_USER'),
    password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
    database: configService.getOrThrow<string>('POSTGRES_DATABASE'),
    entities: [
      UserEntity,
      ProfileEntity,
      PostEntity,
      LikeEntity,
      CommentEntity,
      PublicFileEntity,
    ],
    autoLoadEntities: true,
    // dropSchema: true,
    synchronize: IS_DEV_ENV,
  };
}
