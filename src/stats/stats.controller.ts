import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { EventsByDayQueryDto } from './dto/events-by-day.dto';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  overview() {
    return this.statsService.getOverview();
  }

  @Get('events-by-day')
  eventsByDay(@Query() query: EventsByDayQueryDto) {
    const days = typeof query.days === 'number' ? query.days : undefined;
    return this.statsService.getEventsByDay(
      query.type,
      days,
      query.from,
      query.to,
    );
  }

  @Get('categories')
  categories() {
    return this.statsService.getCategories();
  }

  @Get('summary')
  summary(@Query('days') days?: string) {
    const nDays = days ? parseInt(days, 10) : undefined;
    return this.statsService.getSummary(nDays ?? 14);
  }

  @Get('top-news')
  topNews(@Query('days') days?: string, @Query('limit') limit?: string) {
    const nDays = days ? parseInt(days, 10) : undefined;
    const nLimit = limit ? parseInt(limit, 10) : undefined;
    return this.statsService.getTopNews(nDays ?? 14, nLimit ?? 5);
  }
}
