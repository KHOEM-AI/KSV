/**
 * KSV — Express App Setup
 * Location: src/app/app.ts
 * 
 * បង្កើត Express app, ដាក់ middleware, ភ្ជាប់ routes
 * មិនចាប់ផ្ដើម server — ធ្វើនៅ server.ts
 */

import express, { type Express } from 'express';
import cors from 'cors';
import mainRouter from '../routes';
import { errorHandler } from '../middleware/error-handler';
import { requestLogger } from '../core/logger/request-logger';

export function createApp(): Express {
  const app = express();

  // =====================================================
  // GLOBAL MIDDLEWARE
  // =====================================================

  // CORS
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    })
  );

  // Body Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request Logger
  app.use(requestLogger);

  // =====================================================
  // ROUTES
  // =====================================================

  app.use('/api', mainRouter);

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // =====================================================
  // ERROR HANDLER (ត្រូវដាក់ចុងក្រោយបំផុត)
  // =====================================================

  app.use(errorHandler);

  return app;
}
