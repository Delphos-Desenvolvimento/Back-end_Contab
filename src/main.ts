import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const defaultFrontendUrl = 'https://contab-pi.com.br';
  const normalizeOrigin = (origin: string) => origin.replace(/\/$/, '');

  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';
  const frontendUrl = normalizeOrigin(
    process.env.FRONTEND_URL || defaultFrontendUrl,
  );
  const nodeEnv = process.env.NODE_ENV || 'development';

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const extraOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean);

  const allowedOrigins = [...new Set([frontendUrl, ...extraOrigins])].filter(
    Boolean,
  );

  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, x-session-id',
    exposedHeaders: 'Content-Length, ETag, Authorization',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);
  logger.log(`CORS restricted to: ${allowedOrigins.join(', ')}`);

  logger.log(`NODE_ENV=${nodeEnv}`);

  app.setGlobalPrefix('api');

  try {
    await app.listen(port, host);
  } catch {
    await app.listen(port);
    logger.error(`listen ${host}:${port} failed, fallback to 0.0.0.0:${port}`);
  }

  logger.log(`Application is running in ${nodeEnv} mode`);
  logger.log(`Listening on ${host}:${port}`);
  logger.log(`Frontend URL: ${frontendUrl}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start the application', err);
  process.exit(1);
});
