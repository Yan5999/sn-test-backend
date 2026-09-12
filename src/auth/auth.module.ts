import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';
import { SessionSerializer } from './session.serializer';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ session: true }),
    EmailConfirmationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
