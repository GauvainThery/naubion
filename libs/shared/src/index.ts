// Analysis result types
export interface AnalysisResult {
  url: string;
  timestamp: string;
}

// Progress tracking types
export interface ProgressUpdate {
  stage: AnalysisStage;
  progress: number;
  message: string;
  details?: Record<string, any>;
}

export type AnalysisStage = 'initializing' | 'loading_page' | 'finalizing' | 'completed' | 'error';

// API request/response types
export interface AnalysisRequest {
  url: string;
  options?: AnalysisOptions;
}

export interface AnalysisOptions {
  includeScreenshots?: boolean;
  device?: 'desktop' | 'mobile';
  throttling?: 'none' | 'slow-3g' | 'fast-3g';
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'progress' | 'result' | 'error';
  sessionId: string;
  data: ProgressUpdate | AnalysisResult | ErrorData;
}

export interface ErrorData {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

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
