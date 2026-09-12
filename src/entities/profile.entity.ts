import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PublicFileEntity } from './public-file.entity';
import { UserEntity } from './user.entity';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @OneToOne(() => PublicFileEntity, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  avatar: PublicFileEntity;

  @OneToOne(() => UserEntity, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
