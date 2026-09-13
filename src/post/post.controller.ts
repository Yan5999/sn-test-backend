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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
import {
  MAX_FILES_PER_POST,
  MAX_VIDEO_SIZE,
} from '../libs/file/file.constants';
import { MediaFilesValidationPipe } from '../libs/file/pipes/media-files-validation.pipe';

import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  public constructor(private readonly postService: PostService) {}
  @ApiOperation({ summary: 'Create a post with up to 10 media files' })
  @ApiCookieAuth()
  @ApiResponse({ status: 201, description: 'Post created.' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size.' })
  @ApiResponse({ status: 413, description: 'File is too large.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string', example: 'My first post' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Up to 10 files. Images max 2 MB, videos max 16 MB.',
        },
      },
    },
  })
  @UseGuards(AuthenticatedGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_POST, {
      limits: { fileSize: MAX_VIDEO_SIZE },
    }),
  )
  public create(
    @Req() req: Request,
    @Body() dto: CreatePostDto,
    @UploadedFiles(MediaFilesValidationPipe) files: Express.Multer.File[],
  ) {
    return this.postService.create(req.user!.id, dto, files);
  }

  @ApiOperation({ summary: 'Get all posts with pagination.' })
  @ApiResponse({ status: 200, description: 'Get all posts.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @Get()
  public findAll(@Query() pagination: PaginationDto, @Req() req: Request) {
    return this.postService.findAll(pagination, req.user?.id);
  }

  @ApiOperation({ summary: 'Get a single post by id' })
  @ApiResponse({ status: 200, description: 'Post found.' })
  @ApiResponse({ status: 400, description: 'Invalid uuid.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @Get(':id')
  public findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.postService.findOne(id, req.user?.id);
  }
  @ApiOperation({ summary: 'Delete own post with its files' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Post deleted.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  @ApiResponse({ status: 403, description: 'Not the author of the post.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  public remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.postService.remove(id, req.user!.id);
  }
}
