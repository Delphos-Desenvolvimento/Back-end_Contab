import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type RawCommentRow = {
  id: number;
  newsId: number;
  parentId: number | null;
  author: string;
  email: string;
  content: string;
  created_at: Date;
};

export type CommentDto = {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  replies?: CommentDto[];
};

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`comments\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`newsId\` INT NOT NULL,
        \`parent_id\` INT NULL,
        \`author\` VARCHAR(191) NOT NULL,
        \`email\` VARCHAR(191) NOT NULL,
        \`content\` TEXT NOT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_comments_newsId\` (\`newsId\`),
        INDEX \`idx_comments_parent_id\` (\`parent_id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
  }

  async getAllByNewsId(newsId: number): Promise<CommentDto[]> {
    await this.ensureTable();
    const rows = await this.prisma.$queryRawUnsafe<RawCommentRow[]>(
      `SELECT id, newsId, parent_id as parentId, author, email, content, created_at FROM comments WHERE newsId = ? ORDER BY created_at ASC`,
      newsId,
    );

    const byId = new Map<number, CommentDto & { parentId: number | null }>();
    const roots: Array<CommentDto & { parentId: number | null }> = [];

    for (const r of rows) {
      byId.set(r.id, {
        id: r.id,
        author: r.author,
        content: r.content,
        createdAt: r.created_at.toISOString(),
        replies: [],
        parentId: r.parentId,
      });
    }

    for (const node of byId.values()) {
      if (node.parentId) {
        const parent = byId.get(node.parentId);
        if (parent) parent.replies!.push(node);
        else roots.push(node); // orphan fallback
      } else {
        roots.push(node);
      }
    }

    return roots.map((node) => ({
      id: node.id,
      author: node.author,
      content: node.content,
      createdAt: node.createdAt,
      replies: node.replies,
    }));
  }

  async create(data: {
    author: string;
    email: string;
    content: string;
    newsId: number;
  }): Promise<CommentDto> {
    await this.ensureTable();
    const { author, email, content, newsId } = data;
    await this.prisma.$executeRawUnsafe(
      'INSERT INTO `comments` (`newsId`, `parent_id`, `author`, `email`, `content`) VALUES (?, NULL, ?, ?, ?)',
      newsId,
      author,
      email,
      content,
    );
    const inserted = await this.prisma.$queryRawUnsafe<
      Array<{ id: number; author: string; content: string; created_at: Date }>
    >(
      'SELECT id, author, content, created_at FROM `comments` WHERE id = LAST_INSERT_ID()',
    );
    const row = inserted[0];
    return {
      id: row.id,
      author: row.author,
      content: row.content,
      createdAt: row.created_at.toISOString(),
      replies: [],
    };
  }

  async replyTo(
    commentId: number,
    data: { author: string; email: string; content: string },
  ): Promise<CommentDto> {
    await this.ensureTable();
    const parent = await this.prisma.$queryRawUnsafe<
      Array<{ id: number; newsId: number }>
    >('SELECT id, newsId FROM `comments` WHERE id = ?', commentId);
    if (!parent[0]) throw new NotFoundException('Parent comment not found');

    await this.prisma.$executeRawUnsafe(
      'INSERT INTO `comments` (`newsId`, `parent_id`, `author`, `email`, `content`) VALUES (?, ?, ?, ?, ?)',
      parent[0].newsId,
      commentId,
      data.author,
      data.email,
      data.content,
    );
    const inserted = await this.prisma.$queryRawUnsafe<
      Array<{ id: number; author: string; content: string; created_at: Date }>
    >(
      'SELECT id, author, content, created_at FROM `comments` WHERE id = LAST_INSERT_ID()',
    );
    const row = inserted[0];
    return {
      id: row.id,
      author: row.author,
      content: row.content,
      createdAt: row.created_at.toISOString(),
      replies: [],
    };
  }
}
