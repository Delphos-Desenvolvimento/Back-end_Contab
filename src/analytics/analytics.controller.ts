import { Body, Controller, Post, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import type { Request } from 'express';

type TrackEventDto = {
  type: string;
  newsId?: number;
  path?: string;
  userId?: number;
};

@Controller('events')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post()
  async track(@Body() body: TrackEventDto, @Req() req: Request) {
    const ip =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      undefined;
    const userAgent = req.headers['user-agent'] || undefined;
    return this.analytics.track({
      ...body,
      ip,
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
    });
  }
}
