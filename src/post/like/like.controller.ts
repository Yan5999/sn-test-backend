import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';

import { LikeService } from './like.service';

@ApiTags('Likes')
@UseGuards(AuthenticatedGuard)
@Controller('posts/:postId/like')
export class LikeController {
  public constructor(private readonly likeService: LikeService) {}
  @ApiOperation({ summary: 'Like a post' })
  @ApiCookieAuth()
  @ApiResponse({ status: 201, description: 'Post liked.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @ApiResponse({ status: 409, description: 'Already liked.' })
  @Post()
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  public like(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Req() req: Request,
  ) {
    return this.likeService.like(postId, req.user!.id);
  }

  @ApiOperation({ summary: 'Remove like' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Post unliked.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @Delete()
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  public unlike(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Req() req: Request,
  ) {
    return this.likeService.unlike(postId, req.user!.id);
  }
}
