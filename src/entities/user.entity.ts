import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';
import { PostEntity } from './post.entity';
import { ProfileEntity } from './profile.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Exclude()
  @Column({ nullable: true, type: 'varchar' })
  emailVerificationToken: string | null;

  @Exclude()
  @Column({ nullable: true, type: 'timestamptz' })
  emailVerificationTokenExpiresAt: Date | null;

  @OneToOne(() => ProfileEntity, (profile) => profile.user, { cascade: true })
  profile: ProfileEntity;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.user)
  likes: LikeEntity[];

  @ManyToMany(() => UserEntity, (user) => user.following)
  @JoinTable({
    name: 'user_followers',
    joinColumn: { name: 'followingId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'followerId', referencedColumnName: 'id' },
  })
  followers: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.followers)
  following: UserEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
