/**
 * Analysis domain model - Core analysis concepts and value objects
 */

import { ResourceCollection } from './resource.js';

// Analysis configuration value objects
export interface AnalysisOptions {
  interactionLevel: 'minimal' | 'default' | 'thorough';
  deviceType: 'desktop' | 'mobile';
  maxInteractions: number;
  maxScrollSteps: number;
  timeout: number;
  verboseLogging: boolean;
}

export interface DeviceConfiguration {
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
  };
  userAgent: string;
}

// Analysis result aggregate root
export interface AnalysisResult {
  url: string;
  timestamp: string;
  options: AnalysisOptions;
  duration: number;
  resources: ResourceCollection;
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

// Device configurations for different types
export const DEVICE_CONFIGURATIONS: Record<string, DeviceConfiguration> = {
  desktop: {
    viewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false
    },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  mobile: {
    viewport: {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
  }
};

// Analysis configuration factory
export function createAnalysisOptions(
  interactionLevel: 'minimal' | 'default' | 'thorough' = 'default',
  deviceType: 'desktop' | 'mobile' = 'desktop'
): AnalysisOptions {
  const baseConfig = {
    interactionLevel,
    deviceType,
    timeout: 120000,
    verboseLogging: true
  };

  switch (interactionLevel) {
    case 'minimal':
      return {
        ...baseConfig,
        maxInteractions: 2,
        maxScrollSteps: 2
      };
    case 'thorough':
      return {
        ...baseConfig,
        maxInteractions: 10,
        maxScrollSteps: 8
      };
    default: // 'default'
      return {
        ...baseConfig,
        maxInteractions: 5,
        maxScrollSteps: 5
      };
  }
}
