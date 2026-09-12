import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../entities/user.entity';
import { MailModule } from '../../libs/mail/mail.module';

import { EmailConfirmationController } from './email-confirmation.controller';
import { EmailConfirmationService } from './email-confirmation.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MailModule],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
