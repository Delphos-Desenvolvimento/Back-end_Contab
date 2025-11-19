import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto, UpdateNewsDto } from './DTO/news.dto';
type MulterFile = {
  buffer?: Buffer;
  mimetype?: string;
  originalname?: string;
  path?: string;
};

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto) {
    const { images, imagesBase64, newsimg, ...newsData } = createNewsDto;

    const data: any = { ...newsData };

    if (data.date !== undefined) {
      const val = data.date;
      if (typeof val === 'string') {
        const s = val.trim();
        if (!s) {
          delete data.date;
        } else {
          const d = new Date(s);
          if (Number.isNaN(d.getTime())) {
            delete data.date;
          } else {
            data.date = d;
          }
        }
      } else if (!(val instanceof Date)) {
        delete data.date;
      }
    }

    const created = await this.prisma.news.create({
      data,
      select: { id: true },
    });

    const fileBase64s = (Array.isArray(images) ? images : [])
      .map((img: MulterFile) =>
        img?.buffer ? img.buffer.toString('base64') : undefined,
      )
      .filter((b): b is string => !!b);

    const arrayBase64s = (
      Array.isArray(imagesBase64) ? imagesBase64 : []
    ).filter((b): b is string => typeof b === 'string' && b.length > 0);

    const bannerBase64 =
      typeof newsimg === 'string' && newsimg.length > 0 ? newsimg : undefined;

    const toInsert = [
      ...fileBase64s.map((b64, idx) => ({
        newsId: created.id,
        base64: b64,
        altText:
          Array.isArray(images) && (images[idx] as MulterFile)?.originalname
            ? (images[idx] as MulterFile).originalname
            : undefined,
      })),
      ...arrayBase64s.map((b64) => ({ newsId: created.id, base64: b64 })),
      ...(bannerBase64 ? [{ newsId: created.id, base64: bannerBase64 }] : []),
    ];

    if (toInsert.length > 0) {
      await this.prisma.newsImg.createMany({ data: toInsert });
    }

    return this.prisma.news.findUnique({
      where: { id: created.id },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        date: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            base64: true,
            altText: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        date: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            base64: true,
            altText: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        date: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            base64: true,
            altText: true,
          },
        },
      },
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
    const { images, imagesBase64, newsimg, ...updateData } = updateNewsDto;

    await this.findOne(id);

    const data: any = { ...updateData };

    if (data.date !== undefined) {
      const val = data.date;
      if (typeof val === 'string') {
        const s = val.trim();
        if (!s) {
          delete data.date;
        } else {
          const d = new Date(s);
          if (Number.isNaN(d.getTime())) {
            delete data.date;
          } else {
            data.date = d;
          }
        }
      } else if (!(val instanceof Date)) {
        delete data.date;
      }
    }

    const updated = await this.prisma.news.update({
      where: { id },
      data,
      select: { id: true },
    });

    await this.prisma.newsImg.deleteMany({ where: { newsId: id } });

    const fileBase64sU = (Array.isArray(images) ? images : [])
      .map((img: MulterFile) =>
        img?.buffer ? img.buffer.toString('base64') : undefined,
      )
      .filter((b): b is string => !!b);

    const arrayBase64sU = (
      Array.isArray(imagesBase64) ? imagesBase64 : []
    ).filter((b): b is string => typeof b === 'string' && b.length > 0);

    const bannerBase64U =
      typeof newsimg === 'string' && newsimg.length > 0 ? newsimg : undefined;

    const toInsertU = [
      ...fileBase64sU.map((b64, idx) => ({
        newsId: id,
        base64: b64,
        altText:
          Array.isArray(images) && (images[idx] as MulterFile)?.originalname
            ? (images[idx] as MulterFile).originalname
            : undefined,
      })),
      ...arrayBase64sU.map((b64) => ({ newsId: id, base64: b64 })),
      ...(bannerBase64U ? [{ newsId: id, base64: bannerBase64U }] : []),
    ];

    if (toInsertU.length > 0) {
      await this.prisma.newsImg.createMany({ data: toInsertU });
    }

    return this.prisma.news.findUnique({
      where: { id: updated.id },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        date: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            base64: true,
            altText: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    // Check if news exists
    await this.findOne(id);
    
    return this.prisma.news.delete({
      where: { id },
    });
  }

  async archive(id: number) {
    await this.findOne(id);
    const updated = await this.prisma.news.update({
      where: { id },
      data: { status: 'arquivado' },
      select: { id: true },
    });
    return this.prisma.news.findUnique({
      where: { id: updated.id },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        date: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: { id: true, base64: true, altText: true },
        },
      },
    });
  }

  async restore(id: number) {
    await this.findOne(id);
    const updated = await this.prisma.news.update({
      where: { id },
      data: { status: 'publicada' },
      select: { id: true },
    });
    return this.prisma.news.findUnique({
      where: { id: updated.id },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        date: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: { id: true, base64: true, altText: true },
        },
      },
    });
  }
}
