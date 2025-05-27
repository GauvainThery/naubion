/**
 * Error handling utilities and middleware
 * Centralizes error handling for better maintainability
 */

import { getConfig } from '../config/index.js';

/**
 * Custom error classes for different types of errors
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

export class AnalysisError extends Error {
  constructor(message, url = null) {
    super(message);
    this.name = 'AnalysisError';
    this.url = url;
    this.statusCode = 500;
  }
}

export class TimeoutError extends Error {
  constructor(message, timeout = null) {
    super(message);
    this.name = 'TimeoutError';
    this.timeout = timeout;
    this.statusCode = 408;
  }
}

/**
 * Express error handling middleware
 */
export function errorHandler(err, req, res) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const enableLogging = getConfig('logging.enableRequestLogging');

  // Log error details
  if (enableLogging) {
    console.error(`[${new Date().toISOString()}] Error:`, {
      name: err.name,
      message: err.message,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ...(isDevelopment && { stack: err.stack })
    });
  }

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Prepare error response
  const errorResponse = {
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
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Resource not found',
    status: 404,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}

/**
 * Validate URL format
 */
export function validateUrl(url) {
  if (!url) {
    throw new ValidationError('URL is required', 'url');
  }

  if (typeof url !== 'string') {
    throw new ValidationError('URL must be a string', 'url');
  }

  try {
    new URL(url);
  } catch (error) {
    throw new ValidationError('Invalid URL format', 'url');
  }

  // Check for supported protocols
  const urlObj = new URL(url);
  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    throw new ValidationError('URL must use HTTP or HTTPS protocol', 'url');
  }

  return true;
}

/**
 * Validate analysis options
 */
export function validateAnalysisOptions(options) {
  const { interactionLevel, deviceType } = options;

  const validInteractionLevels = ['minimal', 'default', 'thorough'];
  const validDeviceTypes = ['desktop', 'mobile'];

  if (interactionLevel && !validInteractionLevels.includes(interactionLevel)) {
    throw new ValidationError(
      `Invalid interaction level. Must be one of: ${validInteractionLevels.join(', ')}`,
      'interactionLevel'
    );
  }

  if (deviceType && !validDeviceTypes.includes(deviceType)) {
    throw new ValidationError(
      `Invalid device type. Must be one of: ${validDeviceTypes.join(', ')}`,
      'deviceType'
    );
  }

  return true;
}
