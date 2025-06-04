/**
 * Error handling utilities and middleware
 */

import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config/index.js';
import logger from './logger.js';

/**
 * Custom error classes for different types of errors
 */
export class ValidationError extends Error {
  public readonly statusCode = 400;
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class AnalysisError extends Error {
  public readonly statusCode = 500;
  public readonly url?: string;

  constructor(message: string, url?: string) {
    super(message);
    this.name = 'AnalysisError';
    this.url = url;
  }
}

export class TimeoutError extends Error {
  public readonly statusCode = 408;
  public readonly timeout?: number;

  constructor(message: string, timeout?: number) {
    super(message);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

/**
 * Express error handling middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Determine if we're in development mode
  const isDevelopment = getConfig<string>('nodeEnv') === 'development';

  // Log error details
  logger.error('Request error', {
    name: err.name,
    message: err.message,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ...(isDevelopment ? { stack: err.stack } : {})
  });

  // Determine status code
  const statusCode = 'statusCode' in err ? (err as any).statusCode : 500;

  // Prepare error response
  const errorResponse: Record<string, any> = {
    error: err.message || 'Internal server error',
    status: statusCode,
    timestamp: new Date().toISOString()
  };

  // Add additional fields for specific error types
  if (err instanceof ValidationError && err.field) {
    errorResponse.field = err.field;
  }

  if (err instanceof AnalysisError && err.url) {
    errorResponse.url = err.url;
  }

  if (err instanceof TimeoutError && err.timeout) {
    errorResponse.timeout = err.timeout;
  }

  // Include stack trace in development
  if (isDevelopment) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Resource not found',
    status: 404,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}

/**
 * Async handler wrapper to catch async errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * URL validation function
 */
export function validateUrl(url: string): void {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('URL is required', 'url');
  }

  try {
    new URL(url);
  } catch {
    throw new ValidationError('Invalid URL format', 'url');
  }

  // Check for valid protocols
  const validProtocols = ['http:', 'https:'];
  const urlObj = new URL(url);
  if (!validProtocols.includes(urlObj.protocol)) {
    throw new ValidationError('URL must use HTTP or HTTPS protocol', 'url');
  }
}

/**
 * Analysis options validation
 */
export function validateAnalysisOptions(options: {
  interactionLevel?: string;
  deviceType?: string;
}): void {
  const { interactionLevel, deviceType } = options;

  const validInteractionLevels = ['minimal', 'default', 'thorough'];
  if (interactionLevel && !validInteractionLevels.includes(interactionLevel)) {
    throw new ValidationError(
      `Invalid interaction level. Must be one of: ${validInteractionLevels.join(', ')}`,
      'interactionLevel'
    );
  }

  const validDeviceTypes = ['desktop', 'mobile'];
  if (deviceType && !validDeviceTypes.includes(deviceType)) {
    throw new ValidationError(
      `Invalid device type. Must be one of: ${validDeviceTypes.join(', ')}`,
      'deviceType'
    );
  }
}

/**
 * Full website analysis validation
 */
export function validateFullWebsiteAnalysis(options: {
  analysisMode?: string;
  fullWebsiteAnalysis?: {
    maxPages?: number;
    maxDepth?: number;
  };
}): void {
  const { analysisMode, fullWebsiteAnalysis } = options;

  if (analysisMode === 'full-website') {
    if (!fullWebsiteAnalysis || typeof fullWebsiteAnalysis !== 'object') {
      throw new ValidationError(
        'Full website analysis configuration is required',
        'fullWebsiteAnalysis'
      );
    }

    const { maxPages, maxDepth } = fullWebsiteAnalysis;

    if (maxPages && (typeof maxPages !== 'number' || maxPages < 1 || maxPages > 50)) {
      throw new ValidationError(
        'maxPages must be a number between 1 and 50',
        'fullWebsiteAnalysis.maxPages'
      );
    }

    if (maxDepth && (typeof maxDepth !== 'number' || maxDepth < 1 || maxDepth > 5)) {
      throw new ValidationError(
        'maxDepth must be a number between 1 and 5',
        'fullWebsiteAnalysis.maxDepth'
      );
    }
  }
}
