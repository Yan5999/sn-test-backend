import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { IS_DEV_ENV } from './libs/common/utils/is-dev-util';
import { FileModule } from './libs/file/file.module';
import { CommentModule } from './post/comment/comment.module';
import { LikeModule } from './post/like/like.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV_ENV,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    FileModule,
    LikeModule,
    CommentModule,
    PostModule,
  ],
})
export class AppModule {}
