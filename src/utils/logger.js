/**
 * Logging utility for consistent logging across the application
 */

import { getConfig } from '../config/index.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

/**
 * Simple logger with configurable levels
 */
class Logger {
  constructor() {
    this.level = getConfig('logging.level') || 'info';
    this.enableRequestLogging = getConfig('logging.enableRequestLogging');
  }

  /**
   * Check if log level is enabled
   */
  isEnabled(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }

  /**
   * Format log message with timestamp and level
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (Object.keys(meta).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(meta)}`;
    }

    return `${prefix} ${message}`;
  }

  /**
   * Log error messages
   */
  error(message, meta = {}) {
    if (this.isEnabled('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  /**
   * Log warning messages
   */
  warn(message, meta = {}) {
    if (this.isEnabled('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  /**
   * Log info messages
   */
  info(message, meta = {}) {
    if (this.isEnabled('info')) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  /**
   * Log debug messages
   */
  debug(message, meta = {}) {
    if (this.isEnabled('debug')) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  /**
   * Log analysis progress
   */
  progress(message, progress = {}) {
    if (this.isEnabled('info')) {
      this.info(`📊 ${message}`, progress);
    }
  }

  /**
   * Log analysis steps
   */
  step(message, stepData = {}) {
    if (this.isEnabled('info')) {
      this.info(`🔄 ${message}`, stepData);
    }
  }

  /**
   * Log successful operations
   */
  success(message, meta = {}) {
    if (this.isEnabled('info')) {
      this.info(`✅ ${message}`, meta);
    }
  }

  /**
   * Log HTTP requests
   */
  request(req, res, duration) {
    if (this.enableRequestLogging && this.isEnabled('info')) {
      const meta = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      };

      this.info(`HTTP ${req.method} ${req.url}`, meta);
    }
  }
}

// Create singleton instance
const logger = new Logger();

/**
 * Express middleware for request logging
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(req, res, duration);
  });

  next();
}

export default logger;
