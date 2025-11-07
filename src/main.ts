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
  const frontendUrl = process.env.FRONTEND_URL || 'http://192.168.0.102:5173';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Configure JSON parsing with increased payload size limit for large base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.0.102:5173',
    'http://192.168.0.117:5173'
  ];

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Only allow requests from our frontend
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });
  
  // Log CORS configuration
  logger.log('CORS is enabled for origins:', allowedOrigins);

  // Start the application
  await app.listen(port, '0.0.0.0'); // Listen on all network interfaces
  
  logger.log(`Application is running in ${nodeEnv} mode`);
  logger.log(`Listening on port ${port}`);
  logger.log(`Frontend URL: ${frontendUrl}`);
  logger.log('CORS is enabled for all origins in development mode');
}

bootstrap().catch(err => {
  console.error('Failed to start the application', err);
  process.exit(1);
});
