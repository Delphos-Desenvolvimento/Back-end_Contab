import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('news/:newsId')
  getAllByNews(@Param('newsId', ParseIntPipe) newsId: number) {
    return this.commentsService.getAllByNewsId(newsId);
  }

  @Post()
  create(
    @Body()
    body: {
      author: string;
      email: string;
      content: string;
      newsId: number;
    },
  ) {
    return this.commentsService.create(body);
  }

  @Post(':commentId/replies')
  reply(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: { author: string; email: string; content: string },
  ) {
    return this.commentsService.replyTo(commentId, body);
  }
}
