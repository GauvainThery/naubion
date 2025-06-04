/**
 * Request logging middleware
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../logger.js';

/**
 * Express middleware to log incoming requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
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
}
