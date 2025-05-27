/**
 * Main server file for the Green Web Compass
 * Refactored with proper error handling, logging, and configuration
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConfig, validateConfig } from '../config/index.js';
import { errorHandler, notFoundHandler } from '../utils/errors.js';
import logger, { requestLogger } from '../utils/logger.js';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create and configure Express application
 */
function createApp() {
  const app = express();

  // Validate configuration
  try {
    validateConfig();
    logger.success('Configuration validation passed');
  } catch (error) {
    logger.error('Configuration validation failed', { error: error.message });
    process.exit(1);
  }

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);

  // Request logging middleware (before other middleware)
  app.use(requestLogger);

  // CORS configuration
  const corsConfig = getConfig('server.cors');
  app.use(cors(corsConfig));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve static files from the root directory
  const staticPath = path.resolve(__dirname, '../../');
  app.use(express.static(staticPath));
  logger.debug('Static files served from', { path: staticPath });

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

  // Serve the main page
  app.get('/', (req, res) => {
    const indexPath = path.resolve(__dirname, '../../index.html');
    res.sendFile(indexPath);
  });

  // 404 handler (must be before error handler)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
function startServer() {
  const app = createApp();
  const port = getConfig('server.port');

  logger.info('Starting Green Web Compass server...', {
    port,
    env: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });

  const server = app.listen(port, () => {
    logger.success(`Green Web Compass server running at http://localhost:${port}`);
    logger.info('Ready to analyze websites! 📊');
  });

  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use`);
    } else {
      logger.error('Server error', { error: err.message });
    }
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  return server;
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { createApp, startServer };
export default createApp();
