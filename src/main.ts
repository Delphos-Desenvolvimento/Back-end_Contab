import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

// Load environment variables
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Get environment variables with defaults
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';
  const frontendUrl = process.env.FRONTEND_URL || 'http://192.168.0.102:5173';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Configure JSON parsing with increased payload size limit for large base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://contab.mcolins.com.br',
    'http://www.contab.mcolins.com.br',
    'http://162.240.236.4:5173',
    frontendUrl,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, x-session-id',
    credentials: true,
  });

  // Log CORS configuration
  logger.log('CORS is enabled for origins:', allowedOrigins);

  // Start the application
  try {
    await app.listen(port, host);
  } catch (e: any) {
    try {
      await app.listen(port);
      logger.error(`listen ${host}:${port} failed, fallback to 0.0.0.0:${port}`);
    } catch (e2: any) {
      throw e2;
    }
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
