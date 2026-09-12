import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Register a new user and send confirmation email' })
  @ApiResponse({ status: 201, description: 'User created.' })
  @ApiResponse({ status: 409, description: 'Username/email taken.' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Log in with username and password' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Logged in.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Got current user.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @UseGuards(AuthenticatedGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ summary: 'Destroy session and clear cookie' })
  @ApiResponse({ status: 200, description: 'Logged out.' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }
}
