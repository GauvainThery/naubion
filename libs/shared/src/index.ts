// Configuration types
export interface Config {
  port: number;
  host: string;
  nodeEnv: 'development' | 'production' | 'test';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  puppeteer: {
    executablePath?: string;
    args: string[];
    headless: boolean;
    timeout: number;
  };
  analysis: {
    maxConcurrent: number;
    timeout: number;
    retries: number;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };
  cache: {
    analysisResults: boolean;
    ttlHours: number;
  };
  admin: {
    password: string;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Page routes
export { page, Page } from './page';

// API types for frontend-backend communication
export * from './api-types';
