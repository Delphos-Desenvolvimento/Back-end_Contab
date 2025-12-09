import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NewsService } from './news.service';
import { AuditService } from '../audit/audit.service';
import type { Request as ExpressRequest, Express } from 'express';
import { CreateNewsDto } from './DTO/news.dto';
import { UpdateNewsDto } from './DTO/news.dto';
import { NewsViewInterceptor } from './news-view.interceptor';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  create(
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Body() createNewsDto: CreateNewsDto,
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;

    return this.newsService
      .create({
        ...createNewsDto,
        images: files,
      })
      .then(async (news) => {
        await this.auditService.log({
          type: 'news_create',
          userId,
          path,
          ip,
        });
        return news;
      });
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.newsService.findAll(status);
  }

  @Get(':id')
  @UseInterceptors(NewsViewInterceptor)
  findOne(@Param('id', ParseIntPipe) id: number) {
    console.log(`[NewsController] GET /news/${id} hit`);
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNewsDto: UpdateNewsDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: ExpressRequest,
  ) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;

    return this.newsService
      .update(id, {
        ...updateNewsDto,
        ...(files && { images: files }),
      })
      .then(async (news) => {
        await this.auditService.log({
          type: 'news_update',
          userId,
          path,
          ip,
          newsId: id,
        });
        return news;
      });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: ExpressRequest) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;

    return this.newsService.remove(id).then(async (res) => {
      await this.auditService.log({
        type: 'news_delete',
        userId,
        path,
        ip,
        newsId: id,
      });
      return res;
    });
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  archive(@Param('id', ParseIntPipe) id: number, @Req() req: ExpressRequest) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;

    return this.newsService.archive(id).then(async (news) => {
      await this.auditService.log({
        type: 'news_archive',
        userId,
        path,
        ip,
        newsId: id,
      });
      return news;
    });
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  restore(@Param('id', ParseIntPipe) id: number, @Req() req: ExpressRequest) {
    const userId = (req as ExpressRequest & { user?: { userId?: number } }).user
      ?.userId;
    const path = req.url;
    const ip = req.ip;

    return this.newsService.restore(id).then(async (news) => {
      await this.auditService.log({
        type: 'news_restore',
        userId,
        path,
        ip,
        newsId: id,
      });
      return news;
    });
  }
}
