import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { PaginationDto } from '../../libs/common/dto/pagination.dto';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@Controller()
export class CommentController {
  public constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: 'Add comment to post' })
  @ApiCookieAuth()
  @ApiResponse({ status: 201, description: 'Comment created.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @ApiResponse({ status: 409, description: 'Post already liked.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string', example: 'My first comment' },
      },
    },
  })
  @UseGuards(AuthenticatedGuard)
  @Post('posts/:postId/comments')
  public create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    return this.commentService.create(postId, req.user!.id, dto);
  }

  @ApiOperation({ summary: 'Get paginated comments.' })
  @ApiResponse({ status: 200, description: 'Get all comments by post.' })
  @Get('posts/:postId/comments')
  public findByPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.commentService.findByPost(postId, pagination);
  }

  @ApiOperation({ summary: 'Delete own comment or comment under own post.' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Comment deleted.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @ApiResponse({ status: 403, description: 'Not the author of the comment.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  @UseGuards(AuthenticatedGuard)
  @Delete('comments/:id')
  public remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.commentService.remove(id, req.user!.id);
  }
}
