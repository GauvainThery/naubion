/**
 * Shared types for API communication between frontend and backend
 */

// Resource types
export type ResourceType = 'html' | 'css' | 'js' | 'media' | 'font' | 'other';

export interface Resource {
  url: string;
  contentType: string;
  transferSize: number;
  status: number;
  resourceType: ResourceType;
}

export interface ResourceSizeBreakdown {
  html: number;
  css: number;
  js: number;
  media: number;
  font: number;
  other: number;
}

export interface ResourceCollection {
  resources: Resource[];
  totalTransferSize: number;
  sizeByType: ResourceSizeBreakdown;
  resourceCount: number;
}

// Green hosting types
export interface GreenHostingResult {
  url: string;
  green: boolean;
  duration: number;
  data?: GreenHostingData;
}

export interface GreenHostingData {
  hosted_by?: string;
  hosted_by_website?: string;
  supporting_documents?: Array<{
    id: number;
    title: string;
    link: string;
  }>;
}

// Human readable impact types
export interface HumanReadableImpactInput {
  gCo2e: number;
}

export interface HumanReadableImpactResult {
  meterWithGasolineCar: number;
}

// Analysis types
export interface PageAnalysisOptions {
  interactionLevel: 'minimal' | 'default' | 'thorough';
  deviceType: 'desktop' | 'mobile';
  maxInteractions: number;
  maxScrollSteps: number;
  timeout: number;
  verboseLogging: boolean;
}

export interface PageAnalysisResult {
  url: string;
  timestamp: string;
  expiresAt?: string; // When this cached result expires
  options: PageAnalysisOptions;
  duration: number;
  resources: ResourceCollection;
  greenHosting: GreenHostingResult;
  gCo2e: number;
  humanReadableImpact: HumanReadableImpactResult;
  metadata: {
    pageTitle?: string;
    hasFrames: boolean;
    hasServiceWorker: boolean;
    pageSize: {
      width: number;
      height: number;
    };
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalysisInitResponse {
  analysisId: string;
  estimatedDuration: number;
  status: 'started';
  message: string;
}

// Admin types
export interface AdminApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CacheStats {
  totalAnalyses: number;
  uniqueUrls: number;
  ttlHours: number;
  enabled: boolean;
  oldestAnalysis?: string;
  newestAnalysis?: string;
  totalEntries?: number;
  expiredEntries?: number;
  validEntries?: number;
  totalSizeBytes?: number;
  oldestEntry?: string;
  newestEntry?: string;
  cacheHitRate?: number;
}

// Progress types for analysis
export interface AnalysisProgress {
  analysisId: string;
  progress: number;
  step: string;
  message?: string;
  status?: 'running' | 'completed' | 'failed';
  timestamp: string;
}

// Newsletter types
export interface NewsletterSubscription {
  email: string;
  name?: string;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
}

// Co2e conversion types
export interface Co2eBytesConversionInput {
  bytes: number;
  isGreenHosted: boolean;
}

export interface Co2eBytesConversionResult {
  bytes: number;
  gCo2e: number;
  isGreenHosted: boolean;
}

// Device configuration types
export interface DeviceConfiguration {
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
  };
}
