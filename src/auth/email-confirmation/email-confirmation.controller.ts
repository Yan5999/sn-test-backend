import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ConfirmationDto } from './dto/confirmation.dto';
import { ResendDto } from './dto/resend.dto';
import { EmailConfirmationService } from './email-confirmation.service';

@ApiTags('Email confirmation')
@Controller('auth/email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}
  @ApiOperation({ summary: 'Confirm email by token' })
  @ApiResponse({ status: 200, description: 'User verified.' })
  @ApiResponse({ status: 400, description: 'Token has expired.' })
  @ApiResponse({ status: 404, description: 'Invalid token.' })
  @Post()
  @HttpCode(HttpStatus.OK)
  public async newVerification(@Body() dto: ConfirmationDto) {
    return this.emailConfirmationService.newVerification(dto);
  }

  @ApiOperation({ summary: 'Resend confirm token' })
  @ApiResponse({ status: 200, description: 'User verified.' })
  @ApiResponse({ status: 400, description: 'Email is already verified.' })
  @ApiResponse({ status: 404, description: 'User with this email not found.' })
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  public resend(@Body() dto: ResendDto) {
    return this.emailConfirmationService.resendVerificationToken(dto.email);
  }
}
