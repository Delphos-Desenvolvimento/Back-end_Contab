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
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NewsService } from './news.service';
import { CreateNewsDto } from './DTO/news.dto';
import { UpdateNewsDto } from './DTO/news.dto';
import { Express } from 'express';
import { NewsViewInterceptor } from './news-view.interceptor';

declare global {
  namespace Express {
    interface Multer {
      File: Express.Multer.File;
    }
  }
}

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  create(
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Body() createNewsDto: CreateNewsDto,
  ) {
    return this.newsService.create({
      ...createNewsDto,
      images: files,
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
  ) {
    return this.newsService.update(id, {
      ...updateNewsDto,
      ...(files && { images: files }),
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.archive(id);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.restore(id);
  }
}
