import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto, UpdateNewsDto } from './DTO/news.dto';
import { Express } from 'express';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto) {
    const { images, ...newsData } = createNewsDto;
    
    return this.prisma.news.create({
      data: {
        ...newsData,
        ...(images && images.length > 0 && {
          images: {
            create: images.map((img: Express.Multer.File) => ({
              img: img.path,
              altText: img.originalname,
            })),
          },
        }),
      },
      include: { images: true },
    });
  }

  async findAll() {
    return this.prisma.news.findMany({
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    // Increment view count
    await this.prisma.news.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return news;
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    const { images, ...updateData } = updateNewsDto;
    
    // Check if news exists
    await this.findOne(id);

    return this.prisma.news.update({
      where: { id },
      data: {
        ...updateData,
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((img: Express.Multer.File) => ({
              url: img.path,
              altText: img.originalname,
            })),
          },
        }),
      },
      include: { images: true },
    });
  }

  async remove(id: number) {
    // Check if news exists
    await this.findOne(id);
    
    return this.prisma.news.delete({
      where: { id },
    });
  }
}
