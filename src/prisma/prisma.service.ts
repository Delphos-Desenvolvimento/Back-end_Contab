import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type LogLevel = 'info' | 'query' | 'warn' | 'error';
type LogDefinition = {
  level: LogLevel;
  emit: 'stdout' | 'event';
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const envUrl = process.env.DATABASE_URL;
    let url = envUrl;
    if (envUrl) {
      try {
        const u = new URL(envUrl);
        const sp = u.searchParams;
        if (!sp.has('connection_limit')) sp.set('connection_limit', '20');
        if (!sp.has('pool_timeout')) sp.set('pool_timeout', '60');
        u.search = sp.toString();
        url = u.toString();
      } catch {
        url = envUrl;
      }
    }

    super({
      datasources: url ? { db: { url } } : undefined,
      log: [
        { level: 'warn', emit: 'stdout' },
        { level: 'error', emit: 'stdout' },
      ] as LogDefinition[],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Failed to connect to the database', error.stack);
      } else {
        this.logger.error('Failed to connect to the database');
      }
      throw error as Error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from the database');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Error disconnecting from the database', error.stack);
      } else {
        this.logger.error('Error disconnecting from the database');
      }
      throw error as Error;
    }
  }

  // Add custom methods for your models
  async clearDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear database in production');
    }

    await this.newsImg.deleteMany({});
    await this.eventLog.deleteMany({});
    await this.news.deleteMany({});
    await this.admin.deleteMany({});
    await this.partner.deleteMany({});
    await this.aboutSection.deleteMany({});
    await this.statistic.deleteMany({});
    await this.solution.deleteMany({});
    await this.teamPage.deleteMany({});
    await this.link.deleteMany({});
  }
}
