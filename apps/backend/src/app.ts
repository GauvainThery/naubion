/**
 * Main server file for naubion
 * Refactored with proper error handling, logging, and configuration
 * Implemented with Domain-Driven Design architecture
 */

import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import 'reflect-metadata'; // Required for TypeORM decorators
import { getConfig, validateConfig } from './config/index.js';
import adminRoutes from './infrastructure/api/admin.routes.js';
import apiRoutes from './infrastructure/api/routes.js';
import { closeDatabase, initializeDatabase } from './infrastructure/database/data-source.js';
import { errorHandler, notFoundHandler } from './shared/errors.js';
import logger from './shared/logger.js';

/**
 * Global error handlers to prevent server crashes
 */
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Promise Rejection detected', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString()
  });

  // Log the error but don't exit the process immediately
  // This allows the server to continue running for other requests
  logger.warn('Server continuing to run despite unhandled rejection');
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception detected - this is critical', {
    error: error.message,
    stack: error.stack
  });

  // For uncaught exceptions, we should exit as the process state is unknown
  logger.error('Server will exit due to uncaught exception');
  process.exit(1);
});

/**
 * Create and configure Express application
 */
function createApp(): Application {
  const app = express();

  // Validate configuration
  try {
    validateConfig();
    logger.success('Configuration validation passed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Configuration validation failed', { error: errorMessage });
    process.exit(1);
  }

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);

  // Request logging middleware (before other middleware)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url, ip } = req;

    // Log request details
    logger.info(`${method} ${url}`, {
      ip,
      userAgent: req.get('User-Agent')
    });

    // Log response details when the response is completed
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      // Use different log levels based on status code
      if (statusCode >= 500) {
        logger.error(`${method} ${url} ${statusCode}`, { duration: `${duration}ms` });
      } else if (statusCode >= 400) {
        logger.warn(`${method} ${url} ${statusCode}`, { duration: `${duration}ms` });
      } else {
        logger.info(`${method} ${url} ${statusCode}`, { duration: `${duration}ms` });
      }
    });

    next();
  });

  // CORS configuration
  const corsConfig = {
    origin: getConfig<string>('cors.origin'),
    credentials: getConfig<boolean>('cors.credentials')
  };
  app.use(cors(corsConfig));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint for monitoring
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // API routes
  app.use('/api', apiRoutes);

  // Admin routes with SEO protection
  app.use(
    '/api/admin',
    (req, res, next) => {
      // Add noindex headers for all admin routes
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
      next();
    },
    adminRoutes
  );

  // Serve admin page with SEO protection
  app.get('/admin', (req, res) => {
    // Add noindex headers for admin page
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    res.sendFile(path.join(process.cwd(), 'public', 'admin.html'));
  });

  // 404 handler (must be before error handler)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server with database retry logic
 */
async function startServer(): Promise<void> {
  // Initialize database connection (has built-in retry mechanism)
  try {
    await initializeDatabase();
    logger.success('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database after all retries', { error });
    process.exit(1);
  }

  const app = createApp();
  const port = getConfig<number>('port');

  logger.info('Starting naubion server...', {
    port,
    env: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });

  const server = app.listen(port, () => {
    logger.success(`naubion server running at http://localhost:${port}`);
    logger.info('Ready to analyze websites! 📊');
  });

  server.on('error', (err: Error) => {
    if ('code' in err && err.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use`);
    } else {
      logger.error('Server error', { error: err.message });
    }
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await closeDatabase();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await closeDatabase();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { createApp, startServer };
export default createApp();
