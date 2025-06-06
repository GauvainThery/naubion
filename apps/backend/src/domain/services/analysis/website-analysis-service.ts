/**
 * Website Analysis Domain Service - Core business logic for website-level analysis
 */

import { PageAnalysisResult } from '../../models/analysis/page-analysis.js';
import {
  createWebsiteAnalysisOptions,
  WebsiteAnalysisOptions,
  WebsiteAnalysisResult
} from '../../models/analysis/website-analysis.js';

import { extractDomain, isValidUrl, normalizeUrl } from './page-analysis-service.js';

export interface WebsiteAnalysisContext {
  url: string;
  options: WebsiteAnalysisOptions;
  startTime: Date;
}

export class WebsiteAnalysisDomainService {
  /**
   * Create website analysis context with validated options
   */
  createWebsiteAnalysisContext(
    url: string,
    interactionLevel: 'minimal' | 'default' | 'thorough' = 'default',
    desktopMobileRatio: number = 65, // Default to 65% desktop users
    monthlyVisits: number = 10000 // Default to 10,000 monthly visits
  ): WebsiteAnalysisContext {
    // Validate URL
    if (!isValidUrl(url)) {
      throw new Error(`Invalid URL provided: ${url}`);
    }

    // Create normalized analysis options
    const options = createWebsiteAnalysisOptions(
      interactionLevel,
      desktopMobileRatio,
      monthlyVisits
    );

    return {
      url: normalizeUrl(url),
      options,
      startTime: new Date()
    };
  }

  /**
   * Validate website analysis prerequisites
   */
  validateWebsiteAnalysisPrerequisites(context: WebsiteAnalysisContext): void {
    // Validate URL
    if (!isValidUrl(context.url)) {
      throw new Error(`Invalid URL format: ${context.url}`);
    }

    // Validate desktop/mobile ratio
    if (context.options.desktopMobileRatio < 0 || context.options.desktopMobileRatio > 100) {
      throw new Error('Desktop/mobile ratio must be between 0 and 100');
    }

    // Validate interaction level
    if (!['minimal', 'default', 'thorough'].includes(context.options.interactionLevel)) {
      throw new Error('Invalid interaction level');
    }

    // Validate monthly visits
    if (context.options.monthlyVisits <= 0) {
      throw new Error('Monthly visits must be greater than 0');
    }
  }
  /**
   * Create website analysis result aggregate
   */
  createWebsiteAnalysisResult(
    context: WebsiteAnalysisContext,
    pageAnalysisResults: PageAnalysisResult[],
    startTime: Date
  ): WebsiteAnalysisResult {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    return {
      domain: extractDomain(context.url),
      timestamp: startTime.toISOString(),
      options: context.options,
      duration,
      pages: pageAnalysisResults
    };
  }

  /**
   * Estimate website analysis duration
   */
  estimateWebsiteAnalysisDuration(
    context: WebsiteAnalysisContext,
    estimatedPagesToAnalyze: number
  ): number {
    // Base duration per page analysis (in milliseconds)
    const baseDurationPerPage = this.getBaseDurationForInteractionLevel(
      context.options.interactionLevel
    );

    // Account for device types (both desktop and mobile analysis)
    const deviceMultiplier = 2; // Analyze with both desktop and mobile

    // Add overhead for website-level processing
    const websiteProcessingOverhead = 5000; // 5 seconds

    const estimatedDuration =
      baseDurationPerPage * estimatedPagesToAnalyze * deviceMultiplier + websiteProcessingOverhead;

    return estimatedDuration;
  }

  /**
   * Get base duration for interaction level
   */
  private getBaseDurationForInteractionLevel(interactionLevel: string): number {
    switch (interactionLevel) {
      case 'minimal':
        return 15000; // 15 seconds per page
      case 'thorough':
        return 45000; // 45 seconds per page
      default:
        return 30000; // 30 seconds per page
    }
  }
}
