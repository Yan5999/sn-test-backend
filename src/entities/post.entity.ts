import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';
import { PublicFileEntity } from './public-file.entity';
import { UserEntity } from './user.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => UserEntity, (user) => user.posts, { onDelete: 'CASCADE' })
  author: UserEntity;

  @OneToMany(() => PublicFileEntity, (file) => file.post, {
    cascade: true,
    eager: true,
  })
  files: PublicFileEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.post)
  likes: LikeEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  likeIds?: string[];

  @Exclude()
  commentIds?: string[];

  likesCount?: number;
  commentsCount?: number;
}
