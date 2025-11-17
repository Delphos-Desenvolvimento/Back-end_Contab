import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type LogLevel = 'info' | 'query' | 'warn' | 'error';
type LogDefinition = {
  level: LogLevel;
  emit: 'stdout' | 'event';
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
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
    } catch (error: any) {
      this.logger.error('Failed to connect to the database', error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from the database');
    } catch (error: any) {
      this.logger.error('Error disconnecting from the database', error.stack);
      throw error;
    }
  }

  // Add custom methods for your models
  async clearDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear database in production');
    }
    
    const models = Object.keys(this).filter(
      (key) => 
        !key.startsWith('_') && 
        !['$connect', '$disconnect', '$on', '$transaction', '$use', '$executeRaw', '$queryRaw'].includes(key) &&
        typeof this[key]?.deleteMany === 'function'
    ) as Array<keyof this>;

    return Promise.all(
      models.map((model) => (this[model] as any).deleteMany({}))
    );
  }
}
