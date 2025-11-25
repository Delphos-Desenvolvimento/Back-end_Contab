import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  overview() {
    return this.statsService.getOverview();
  }

  @Get('events-by-day')
  @UseGuards(JwtAuthGuard)
  eventsByDay(@Query('type') type = 'news_click', @Query('days') days?: string) {
    const nDays = days ? parseInt(days, 10) : undefined;
    return this.statsService.getEventsByDay(type, nDays);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  categories() {
    return this.statsService.getCategories();
  }
}
