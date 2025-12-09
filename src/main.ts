import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Get environment variables with defaults
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDev = nodeEnv === 'development';

  // Configure JSON parsing with increased payload size limit for large base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost:4173',
    'http://localhost:3000',
    'https://contab-pi.com.br',
    'http://162.240.236.4:5173',
    frontendUrl,
  ].filter(Boolean);

  if (isDev) {
    app.enableCors({
      origin: true,
      methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      allowedHeaders:
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, x-session-id',
      exposedHeaders: 'Content-Length, ETag, Authorization',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    logger.log('CORS: allowing all origins in development');
  } else {
    app.enableCors({
      origin: allowedOrigins,
      methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      allowedHeaders:
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, x-session-id',
      exposedHeaders: 'Content-Length, ETag, Authorization',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    logger.log('CORS origins:', allowedOrigins);
  }

  logger.log(`NODE_ENV=${nodeEnv}`);

  app.setGlobalPrefix('api');

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin =
      typeof req.headers.origin === 'string' ? req.headers.origin : frontendUrl;
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, x-session-id',
    );
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Expose-Headers',
      'Content-Length, ETag, Authorization',
    );
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    next();
  });

  // Start the application
  try {
    await app.listen(port, host);
  } catch {
    await app.listen(port);
    logger.error(`listen ${host}:${port} failed, fallback to 0.0.0.0:${port}`);
  }

  logger.log(`Application is running in ${nodeEnv} mode`);
  logger.log(`Listening on ${host}:${port}`);
  logger.log(`Frontend URL: ${frontendUrl}`);
  logger.log('CORS is enabled for all origins in development mode');
}

bootstrap().catch((err) => {
  console.error('Failed to start the application', err);
  process.exit(1);
});
