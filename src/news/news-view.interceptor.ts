import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsViewInterceptor implements NestInterceptor {
  // In-memory cache for debouncing requests (fixes race conditions)
  private static viewCache = new Set<string>();

  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const params = request.params;
    const rawId = typeof params?.id === 'string' ? params.id : undefined;
    const newsId = rawId ? parseInt(rawId, 10) : NaN;

    // Get session ID from header or generate one
    const headerVal = request.headers['x-session-id'];
    const sessionId = Array.isArray(headerVal)
      ? (headerVal[0] ?? 'anonymous')
      : ((headerVal as string) ?? 'anonymous');

    console.log(`[NewsViewInterceptor] URL: ${request.url}`);
    console.log(`[NewsViewInterceptor] Params:`, params);
    console.log(
      `[NewsViewInterceptor] Parsed newsId: ${newsId}, sessionId: ${sessionId}`,
    );

    // In-Memory Debounce (Fixes Race Condition)
    const cacheKey = `${sessionId}-${newsId}`;
    if (NewsViewInterceptor.viewCache.has(cacheKey)) {
      console.log(`[NewsViewInterceptor] Debounced (Cache) for ${cacheKey}`);
      return next.handle();
    }

    // Add to cache and remove after 5 seconds
    NewsViewInterceptor.viewCache.add(cacheKey);
    setTimeout(() => NewsViewInterceptor.viewCache.delete(cacheKey), 5000);

    // Check if this session viewed this article in the last 5 seconds (DB check as backup)
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const existingView = await this.prisma.eventLog.findFirst({
      where: {
        newsId,
        type: 'news_view',
        userAgent: sessionId,
        createdAt: {
          gte: fiveSecondsAgo,
        },
      },
    });

    if (existingView) {
      console.log(
        `[NewsViewInterceptor] Debounced (DB) for newsId: ${newsId}, sessionId: ${sessionId}`,
      );
    }

    // If not viewed, log the view event
    if (!existingView && !isNaN(newsId)) {
      console.log(
        `[NewsViewInterceptor] Creating new view event for newsId: ${newsId}`,
      );
      try {
        await this.prisma.$transaction([
          this.prisma.eventLog.create({
            data: {
              type: 'news_view',
              newsId,
              userAgent: sessionId,
              ip: request.ip,
              path: request.url,
            },
          }),
          this.prisma.news.update({
            where: { id: newsId },
            data: { views: { increment: 1 } },
          }),
        ]);
        console.log(
          `[NewsViewInterceptor] View event created and counter incremented successfully`,
        );
      } catch (error) {
        console.error(
          `[NewsViewInterceptor] Error creating view event:`,
          error,
        );
      }
    } else {
      console.log(
        `[NewsViewInterceptor] Skipping view creation. Existing: ${!!existingView}, Valid ID: ${!isNaN(newsId)}`,
      );
    }

    return next.handle();
  }
}
