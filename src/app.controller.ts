import { Controller, Get, Post, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-cors')
  testCors(@Res() res: Response) {
    return res.json({
      message: 'CORS is working!',
      timestamp: new Date().toISOString(),
    });
  }

  @Post('test-cors')
  testCorsPost(@Req() req: Request, @Res() res: Response) {
    console.log('Test CORS POST received:', req.body);
    const receivedBody =
      typeof req.body === 'object' && req.body !== null
        ? (req.body as Record<string, unknown>)
        : String(req.body);
    return res.json({
      message: 'CORS POST is working!',
      receivedBody,
      timestamp: new Date().toISOString(),
    });
  }
}
