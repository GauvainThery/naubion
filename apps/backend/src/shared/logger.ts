/**
 * Logging utility for the application
 */

import { getConfig } from '../config/index.js';

// Log levels
type LogLevel = 'error' | 'warn' | 'info' | 'success' | 'debug' | 'step';
const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  success: 2,
  step: 2,
  debug: 3
};

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

class Logger {
  private level: number;

  constructor() {
    // Get log level from config
    const configLevel = getConfig<string>('logLevel') || 'info';
    this.level = LOG_LEVELS[configLevel as LogLevel] || LOG_LEVELS.info;
  }

  /**
   * Log an error message
   */
  error(message: string, data?: Record<string, unknown>): void {
    if (this.level >= LOG_LEVELS.error) {
      console.error(`${COLORS.red}[ERROR]${COLORS.reset} ${message}`, data || '');
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    if (this.level >= LOG_LEVELS.warn) {
      console.warn(`${COLORS.yellow}[WARN]${COLORS.reset} ${message}`, data || '');
    }
  }

  /**
   * Log an info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    if (this.level >= LOG_LEVELS.info) {
      console.info(`${COLORS.blue}[INFO]${COLORS.reset} ${message}`, data || '');
    }
  }

  /**
   * Log a success message
   */
  success(message: string, data?: Record<string, unknown>): void {
    if (this.level >= LOG_LEVELS.success) {
      console.info(`${COLORS.green}[SUCCESS]${COLORS.reset} ${message}`, data || '');
    }
  }

  /**
   * Log a step message (for progress indication)
   */
  step(message: string, data?: Record<string, unknown>): void {
    if (this.level >= LOG_LEVELS.step) {
      console.info(`${COLORS.cyan}[STEP]${COLORS.reset} ${message}`, data || '');
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (this.level >= LOG_LEVELS.debug) {
      console.debug(`${COLORS.gray}[DEBUG]${COLORS.reset} ${message}`, data || '');
    }
  }
}

// Create a singleton logger instance
const logger = new Logger();

export default logger;
