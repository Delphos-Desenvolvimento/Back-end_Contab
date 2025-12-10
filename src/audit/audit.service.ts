import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type AuditEventInput = {
  type: string;
  userId?: number;
  path?: string;
  newsId?: number;
  userAgent?: string;
  ip?: string;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(event: AuditEventInput) {
    return this.prisma.eventLog.create({
      data: {
        type: event.type,
        userId: event.userId,
        path: event.path,
        newsId: event.newsId,
        userAgent: event.userAgent,
        ip: event.ip,
      },
    });
  }

  async list(params: { type?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(200, Math.max(1, params.limit ?? 50));
    const skip = (page - 1) * limit;

    const where = params.type ? { type: params.type } : undefined;

    const [items, total] = await Promise.all([
      this.prisma.eventLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.eventLog.count({ where }),
    ]);

    const userIds = Array.from(
      new Set(
        items
          .map((l) => l.userId)
          .filter((id): id is number => typeof id === 'number'),
      ),
    );
    const users = userIds.length
      ? await this.prisma.admin.findMany({
          where: { id: { in: userIds } },
          select: { id: true, user: true, role: true },
        })
      : [];
    const usersById = new Map(users.map((u) => [u.id, u]));

    const newsIds = Array.from(
      new Set(
        items
          .map((l) => l.newsId)
          .filter((id): id is number => typeof id === 'number'),
      ),
    );
    const news = newsIds.length
      ? await this.prisma.news.findMany({
          where: { id: { in: newsIds } },
          select: { id: true, title: true },
        })
      : [];
    const newsById = new Map(news.map((n) => [n.id, n.title]));

    const results = items.map((l) => ({
      id: (l as unknown as { id: number }).id,
      type: l.type,
      path: l.path ?? null,
      newsId: l.newsId ?? null,
      newsTitle: l.newsId ? (newsById.get(l.newsId) ?? null) : null,
      userId: l.userId ?? null,
      user: l.userId ? (usersById.get(l.userId) ?? null) : null,
      userAgent: l.userAgent ?? null,
      ip: null as string | null, // Hide IP in API response
      createdAt: l.createdAt,
    }));

    return {
      items: results,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
