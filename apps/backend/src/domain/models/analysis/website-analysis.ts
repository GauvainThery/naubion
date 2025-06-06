/**
 * Website analysis domain model - Core analysis concepts and value objects
 */

import {
  createPageAnalysisOptions,
  PageAnalysisOptions,
  PageAnalysisResult
} from './page-analysis.js';

// Analysis configuration value objects
export interface WebsiteAnalysisOptions {
  interactionLevel: 'minimal' | 'default' | 'thorough';
  desktopMobileRatio: number; // 0-100, percentage of desktop users
  monthlyVisits: number;
  pageAnalysisOptions: Omit<PageAnalysisOptions, 'deviceType'>;
  maxPagesToAnalyze: number;
  timeout: number;
  verboseLogging: boolean;
}

// Analysis result aggregate root
export interface WebsiteAnalysisResult {
  domain: string;
  timestamp: string;
  options: WebsiteAnalysisOptions;
  duration: number;
  pages: Omit<PageAnalysisResult, 'options'>[];
}

// Analysis configuration factory
export function createWebsiteAnalysisOptions(
  interactionLevel: 'minimal' | 'default' | 'thorough' = 'default',
  desktopMobileRatio: number = 65,
  monthlyVisits: number = 10000
): WebsiteAnalysisOptions {
  const baseConfig: WebsiteAnalysisOptions = {
    interactionLevel,
    desktopMobileRatio,
    timeout: 1200000, // 20 minutes default
    verboseLogging: true,
    maxPagesToAnalyze: 4,
    monthlyVisits,
    pageAnalysisOptions: createPageAnalysisOptions(interactionLevel)
  };

  switch (interactionLevel) {
    case 'minimal':
      return {
        ...baseConfig,
        maxPagesToAnalyze: 2
      };
    case 'thorough':
      return {
        ...baseConfig,
        maxPagesToAnalyze: 6
      };
    default:
      return baseConfig;
  }
}
