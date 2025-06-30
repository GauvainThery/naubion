/**
 * Application configuration management
 * Centralizes all configuration settings for easier maintenance
 */

import { Config } from '@naubion/shared';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Default configuration values
const DEFAULT_CONFIG: Config = {
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || 'localhost',
  nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  logLevel: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },

  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--disable-extensions', '--disable-plugins', '--no-sandbox', '--disable-setuid-sandbox'],
    headless: process.env.BROWSER_HEADLESS !== 'false',
    timeout: parseInt(process.env.BROWSER_TIMEOUT || '30000')
  },

  analysis: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_ANALYSIS || '3'),
    timeout: parseInt(process.env.ANALYSIS_TIMEOUT || '120000'),
    retries: parseInt(process.env.ANALYSIS_RETRIES || '2')
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'naubion',
    password: process.env.DB_PASSWORD || 'naubion_password',
    database: process.env.DB_DATABASE || 'naubion',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true'
  },

  cache: {
    analysisResults: process.env.CACHE_ANALYSIS_RESULTS === 'true',
    ttlHours: parseInt(process.env.CACHE_TTL_HOURS || '240')
  },

  admin: {
    password: process.env.ADMIN_PASSWORD || 'admin123'
  }
};

/**
 * Get configuration value by path (e.g., 'cors.origin')
 */
export function getConfig<T = unknown>(path: string): T {
  return path.split('.').reduce((obj: unknown, key: string) => {
    return (obj as Record<string, unknown>)?.[key];
  }, DEFAULT_CONFIG as unknown) as T;
}

/**
 * Get full configuration object
 */
export function getAllConfig(): Config {
  return { ...DEFAULT_CONFIG };
}

/**
 * Validate required configuration
 */
export function validateConfig(): boolean {
  const errors: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Validate port
  const port = getConfig<number>('port');
  if (!port || port < 1 || port > 65535) {
    errors.push('Invalid server port');
  }

  // Validate timeouts
  const analysisTimeout = getConfig<number>('analysis.timeout');
  if (analysisTimeout < 1000) {
    errors.push('Analysis timeout too low (minimum 1000ms)');
  }

  // Production-specific validations
  if (isProduction) {
    // Database credentials must be set
    if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'naubion_password') {
      errors.push('Production database password must be set and not use default value');
    }

    if (!process.env.DB_USERNAME || process.env.DB_USERNAME === 'naubion') {
      errors.push('Production database username should not use default value');
    }

    // Admin password must be secure
    if (
      !process.env.ADMIN_PASSWORD ||
      process.env.ADMIN_PASSWORD === 'admin123' ||
      process.env.ADMIN_PASSWORD === 'admin_password'
    ) {
      errors.push('Production admin password must be set and not use default value');
    }

    // Database synchronization should be disabled
    if (process.env.DB_SYNCHRONIZE === 'true') {
      errors.push(
        'Database synchronization should be disabled in production (DB_SYNCHRONIZE=false)'
      );
    }

    // External services should be configured
    if (
      !process.env.MAILJET_API_KEY ||
      process.env.MAILJET_API_KEY === 'your_mailjet_api_key_here'
    ) {
      errors.push('MailJet API key must be configured in production');
    }

    if (
      !process.env.MAILJET_API_SECRET ||
      process.env.MAILJET_API_SECRET === 'your_mailjet_api_secret_here'
    ) {
      errors.push('MailJet API secret must be configured in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }

  return true;
}

export { DEFAULT_CONFIG };
export default {
  getConfig,
  getAllConfig,
  validateConfig,
  ...DEFAULT_CONFIG
};
