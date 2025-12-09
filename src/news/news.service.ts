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

    const data: {
      title: string;
      content: string;
      category: string;
      status?: string;
      date?: Date;
    } = {
      title: newsData.title,
      content: newsData.content,
      category: newsData.category,
    };
    if (newsData.status) data.status = newsData.status;
    if (newsData.date) {
      const s = newsData.date.trim();
      if (s) {
        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) data.date = d;
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

  async findAll(status?: string) {
    return this.prisma.news.findMany({
      where: status ? { status } : undefined,
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

    // Calculate view count from EventLog
    const viewCount = await this.getViewCount(id);

    return {
      ...news,
      views: viewCount,
    };
  }

  async getViewCount(newsId: number): Promise<number> {
    const count = await this.prisma.eventLog.count({
      where: {
        newsId,
        type: 'news_view',
      },
    });
    return count;
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    const { images, imagesBase64, newsimg, ...updateData } = updateNewsDto;

    await this.findOne(id);

    const data: {
      title?: string;
      content?: string;
      category?: string;
      status?: string;
      date?: Date;
    } = {};
    if (updateData.title) data.title = updateData.title;
    if (updateData.content) data.content = updateData.content;
    if (updateData.category) data.category = updateData.category;
    if (updateData.status) data.status = updateData.status;
    if (updateData.date) {
      const s = updateData.date.trim();
      if (s) {
        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) data.date = d;
      }
    }

    const updated = await this.prisma.news.update({
      where: { id },
      data,
      select: { id: true },
    });

    const hasNewImages =
      (Array.isArray(images) && images.length > 0) ||
      (Array.isArray(imagesBase64) && imagesBase64.length > 0) ||
      (typeof newsimg === 'string' && newsimg.length > 0);

    console.log('[NewsService] update:', {
      id,
      hasNewImages,
      imagesLen: images?.length,
      imagesBase64Len: imagesBase64?.length,
      newsimgLen: newsimg?.length,
    });

    if (hasNewImages) {
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
