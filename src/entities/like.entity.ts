import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity('likes')
@Unique(['user', 'post'])
export class LikeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.likes, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.likes, { onDelete: 'CASCADE' })
  post: PostEntity;

  @CreateDateColumn()
  createdAt: Date;
}
