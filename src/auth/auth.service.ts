import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { Request, Response } from 'express';

import { UserService } from '../user/user.service';

import { RegisterDto } from './dto/register.dto';
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service';

@Injectable()
export class AuthService {
  public constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  public async register(dto: RegisterDto) {
    const existingByEmail = await this.userService.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException('User with this email already exists.');
    }

    const existingByUsername = await this.userService.findByUsername(
      dto.username,
    );
    if (existingByUsername) {
      throw new ConflictException('User with this username already exists.');
    }

    const user = await this.userService.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });

    await this.emailConfirmationService.sendVerificationToken(user);

    return user;
  }

  public async validateUser(username: string, pass: string) {
    const user = await this.userService.findByUsername(username);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isValidPassword = await argon2.verify(user.password, pass);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Your email is not verified. Please check your inbox and confirm your email address.',
      );
    }

    return user;
  }

  public async logout(req: Request, res: Response) {
    return new Promise((resolve, reject) => {
      req.logout((logoutErr) => {
        if (logoutErr) {
          return reject(new InternalServerErrorException('Logout failed.'));
        }
        req.session.destroy((destroyErr) => {
          if (destroyErr) {
            return reject(
              new InternalServerErrorException('Failed to destroy session.'),
            );
          }
          res.clearCookie(
            this.configService.getOrThrow<string>('SESSION_NAME'),
          );
          resolve(true);
        });
      });
    });
  }
}
