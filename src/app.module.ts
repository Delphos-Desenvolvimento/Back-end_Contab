import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { StatsModule } from './stats/stats.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PartnersModule } from './partners/partners.module';
import { ContentModule } from './content/content.module';
import { TeamModule } from './team/team.module';
import { ConfigModule } from '@nestjs/config';
import { LinkModule } from './link/link.module';
import { CommentsModule } from './comments/comments.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AdminModule,
    AuthModule,
    NewsModule,
    StatsModule,
    AnalyticsModule,
    PartnersModule,
    ContentModule,
    TeamModule,
    LinkModule,
    CommentsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
