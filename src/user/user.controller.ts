import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { PaginationDto } from '../libs/common/dto/pagination.dto';
import { MAX_IMAGE_SIZE } from '../libs/file/file.constants';
import { ImageFileValidationPipe } from '../libs/file/pipes/image-file-validation.pipe';

import { SearchUsersDto } from './dto/search-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Search users by username, first or last name' })
  @ApiResponse({ status: 200, description: 'Got users.' })
  @Get('search')
  public search(@Query() dto: SearchUsersDto) {
    return this.userService.search(dto);
  }

  @ApiOperation({ summary: 'Get public profile with posts and counters' })
  @ApiResponse({ status: 200, description: 'Got profile.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  @Get(':username')
  public getProfile(
    @Param('username') username: string,
    @Query() pagination: PaginationDto,
    @Req() req: Request,
  ) {
    return this.userService.getPublicProfile(
      username,
      pagination,
      req.user?.id,
    );
  }

  @ApiOperation({ summary: 'Update own profile' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @Patch('me/profile')
  @UseGuards(AuthenticatedGuard)
  public updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user!.id, dto);
  }

  @ApiOperation({ summary: 'Upload or replace avatar' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Avatar replaced.' })
  @ApiResponse({ status: 400, description: 'Malformed request syntax.' })
  @ApiResponse({ status: 413, description: 'File is too large.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['avatar'],
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  @Patch('me/avatar')
  @UseGuards(AuthenticatedGuard)
  public updateAvatar(
    @Req() req: Request,
    @UploadedFile(ImageFileValidationPipe) file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(req.user!.id, file);
  }

  @ApiOperation({ summary: 'Follow a user' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'User followed.' })
  @ApiResponse({ status: 400, description: 'You cannot follow yourself.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @UseGuards(AuthenticatedGuard)
  @Post(':id/follow')
  @HttpCode(HttpStatus.OK)
  public follow(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.userService.follow(req.user!.id, id);
  }

  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'User unfollowed.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @UseGuards(AuthenticatedGuard)
  @Delete(':id/follow')
  @HttpCode(HttpStatus.OK)
  public unfollow(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.userService.unfollow(req.user!.id, id);
  }
}
