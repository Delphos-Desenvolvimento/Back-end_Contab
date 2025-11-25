import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) { }

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
      categories
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
        select: { id: true, title: true, createdAt: true }
      }),
      this.prisma.admin.count(),
      this.prisma.news.groupBy({
        by: ['category'],
        _count: { category: true }
      })
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

  async getEventsByDay(type: string, days = 14) {
    const safeType = typeof type === 'string' && type.length > 0 ? type : 'news_view';
    const safeDays = Number.isFinite(days) && days > 0 && days <= 365 ? days : 14;

    // Use raw query for date grouping as Prisma doesn't support it natively well
    const rows: Array<{ day: Date; count: bigint }> = await this.prisma.$queryRawUnsafe(
      `SELECT 
        DATE(created_at) as day, 
        COUNT(*) as count 
       FROM event_log 
       WHERE type = ? 
       AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) 
       GROUP BY day 
       ORDER BY day ASC`,
      safeType,
      safeDays,
    );

    // Convert BigInt to Number for JSON serialization
    return rows.map((r) => ({
      date: new Date(r.day).toISOString().split('T')[0],
      count: Number(r.count)
    }));
  }

  async getCategories() {
    const cats = await this.prisma.news.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    return cats
      .map((c) => ({ category: c.category, count: c._count.category }))
      .sort((a, b) => b.count - a.count);
  }
}