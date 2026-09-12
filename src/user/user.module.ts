import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfileEntity } from '../entities/profile.entity';
import { PublicFileEntity } from '../entities/public-file.entity';
import { UserEntity } from '../entities/user.entity';
import { FileModule } from '../libs/file/file.module';
import { PostModule } from '../post/post.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ProfileEntity, PublicFileEntity]),
    FileModule,
    PostModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
