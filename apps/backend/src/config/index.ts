/**
 * Application configuration management
 * Centralizes all configuration settings for easier maintenance
 */

import dotenv from 'dotenv';
import { Config } from '../../../../libs/shared/dist';

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
