import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalNews,
      publishedNews,
      archivedNews,
      draftNews,
      totalViews,
      imagesCount,
      latestNews,
      adminCount,
      categories,
    ] = await Promise.all([
      this.prisma.news.count(),
      this.prisma.news.count({ where: { status: 'publicada' } }),
      this.prisma.news.count({ where: { status: 'arquivado' } }),
      this.prisma.news.count({ where: { status: 'rascunho' } }),
      // Calculate total views from EventLog instead of News table
      this.prisma.eventLog.count({ where: { type: 'news_view' } }),
      this.prisma.newsImg.count(),
      this.prisma.news.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true },
      }),
      this.prisma.admin.count(),
      this.prisma.news.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
    ]);

    const topCategories = categories
      .map((c) => ({ category: c.category, count: c._count.category }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalNews,
      publishedNews,
      archivedNews,
      draftNews,
      totalViews, // Now accurate based on events
      imagesCount,
      latestNews,
      adminCount,
      topCategories,
    };
  }

  async getEventsByDay(
    type?: string,
    days?: number,
    from?: string,
    to?: string,
  ) {
    const allowed = new Set(['news_click', 'news_view']);
    const safeType = type && allowed.has(type) ? type : 'news_click';

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (from && to) {
      const s = new Date(from);
      const e = new Date(to);
      if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
        startDate = s;
        endDate = e;
      }
    }

    let spanDays: number;
    if (startDate && endDate) {
      const ms = endDate.getTime() - startDate.getTime();
      spanDays = Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
      if (spanDays < 1) spanDays = 1;
      if (spanDays > 365) spanDays = 365;
    } else {
      const def =
        typeof days === 'number' && days > 0 && days <= 365 ? days : 14;
      spanDays = def;
      const today = new Date();
      const s = new Date();
      s.setDate(today.getDate() - (def - 1));
      startDate = s;
      endDate = today;
    }

    const rows = await this.prisma.$queryRaw<
      Array<{ day: Date; count: bigint }>
    >(Prisma.sql`
      SELECT DATE(created_at) AS day, COUNT(*) AS count
      FROM event_log
      WHERE type = ${safeType}
        AND created_at >= ${startDate}
        AND created_at < DATE_ADD(${endDate}, INTERVAL 1 DAY)
      GROUP BY day
      ORDER BY day ASC
    `);

    const map = new Map<string, number>();
    for (const r of rows) {
      const key = new Date(r.day).toISOString().split('T')[0];
      map.set(key, Number(r.count));
    }

    const out: Array<{ date: string; count: number }> = [];
    const cursor = new Date(startDate);
    for (let i = 0; i < spanDays; i++) {
      const key = cursor.toISOString().split('T')[0];
      out.push({ date: key, count: map.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  }

  async getSummary(days = 14) {
    const safeDays =
      Number.isFinite(days) && days > 0 && days <= 365 ? days : 14;
    const since = Prisma.sql`DATE_SUB(CURRENT_DATE(), INTERVAL ${safeDays} DAY)`;
    const rows = await this.prisma.$queryRaw<
      Array<{ type: string; count: bigint }>
    >(Prisma.sql`
      SELECT type, COUNT(*) AS count
      FROM event_log
      WHERE created_at >= ${since}
      GROUP BY type
    `);
    const summary: Record<string, number> = {};
    for (const r of rows) summary[r.type] = Number(r.count);
    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    return { total, ...summary };
  }

  async getTopNews(days = 14, limit = 5) {
    const safeDays =
      Number.isFinite(days) && days > 0 && days <= 365 ? days : 14;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 && limit <= 50 ? limit : 5;
    const since = Prisma.sql`DATE_SUB(CURRENT_DATE(), INTERVAL ${safeDays} DAY)`;
    const rows = await this.prisma.$queryRaw<
      Array<{ newsId: number; count: bigint }>
    >(Prisma.sql`
      SELECT newsId, COUNT(*) AS count
      FROM event_log
      WHERE type = 'news_view' AND newsId IS NOT NULL AND created_at >= ${since}
      GROUP BY newsId
      ORDER BY count DESC
      LIMIT ${safeLimit}
    `);
    return rows.map((r) => ({ newsId: r.newsId, count: Number(r.count) }));
  }

  async getCategories() {
    const cats = await this.prisma.news.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    return cats
      .map((c) => ({ category: c.category, count: c._count.category }))
      .sort((a, b) => b.count - a.count);
  }
}
