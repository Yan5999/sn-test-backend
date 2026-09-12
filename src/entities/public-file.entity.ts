import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PostEntity } from './post.entity';

@Entity('public_files')
export class PublicFileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column()
  url: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  size: number;

  @ManyToOne(() => PostEntity, (post) => post.files, { onDelete: 'CASCADE' })
  post: PostEntity;

  @CreateDateColumn()
  createdAt: Date;
}
