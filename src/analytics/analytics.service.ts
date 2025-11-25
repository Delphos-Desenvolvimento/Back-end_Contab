import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type TrackArgs = {
  type: string;
  newsId?: number;
  path?: string;
  userId?: number;
  userAgent?: string;
  ip?: string;
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async track(args: TrackArgs) {
    const { type, newsId, path, userId, userAgent, ip } = args;
    if (!type || typeof type !== 'string' || type.length === 0) {
      return { ok: false };
    }
    try {
      const created = await (this.prisma as any).eventLog.create?.({
        data: { type, newsId: newsId ?? null, path: path ?? null, userId: userId ?? null, userAgent: userAgent ?? null, ip: ip ?? null },
      });
      if (created && created.id) return { ok: true, id: created.id };
    } catch (_) {
      // fall through to raw
    }

    // Fallback: ensure table exists and insert using raw SQL
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`event_log\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`type\` VARCHAR(191) NOT NULL,
        \`newsId\` INT NULL,
        \`path\` VARCHAR(255) NULL,
        \`userId\` INT NULL,
        \`userAgent\` VARCHAR(255) NULL,
        \`ip\` VARCHAR(64) NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    await this.prisma.$executeRawUnsafe(
      'INSERT INTO `event_log` (`type`, `newsId`, `path`, `userId`, `userAgent`, `ip`) VALUES (?, ?, ?, ?, ?, ?)',
      type,
      newsId ?? null,
      path ?? null,
      userId ?? null,
      userAgent ?? null,
      ip ?? null,
    );
    return { ok: true };
  }
}