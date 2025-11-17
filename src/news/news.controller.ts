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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NewsService } from './news.service';
import { CreateNewsDto } from './DTO/news.dto';
import { UpdateNewsDto } from './DTO/news.dto';
import { Express } from 'express';

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
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images'))
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
  findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images'))
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
}
