import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  text: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, { onDelete: 'CASCADE' })
  author: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments, { onDelete: 'CASCADE' })
  post: PostEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
