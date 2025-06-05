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
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
