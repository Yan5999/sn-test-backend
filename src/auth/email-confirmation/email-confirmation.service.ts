import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { UserEntity } from '../../entities/user.entity';
import { MailService } from '../../libs/mail/mail.service';

import { ConfirmationDto } from './dto/confirmation.dto';

@Injectable()
export class EmailConfirmationService {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailService: MailService,
  ) {}

  public async newVerification(dto: ConfirmationDto) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: dto.token },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token.');
    }

    if (
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Verification token has expired. Request a new one.',
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiresAt = null;

    await this.userRepository.save(user);

    return true;
  }

  public async resendVerificationToken(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User with this email not found.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified.');
    }

    return this.sendVerificationToken(user);
  }

  public async sendVerificationToken(user: UserEntity) {
    const token = uuidv4();
    user.emailVerificationToken = token;
    user.emailVerificationTokenExpiresAt = new Date(
      Date.now() + 60 * 60 * 1000,
    );
    await this.userRepository.save(user);

    await this.mailService.sendConfirmationEmail(user.email, token);
    return true;
  }
}
