/**
 * Analysis domain service - Core analysis orchestration logic
 */

import { AnalysisOptions, AnalysisResult, createAnalysisOptions } from '../models/analysis.js';
import { ResourceCollection } from '../models/resource.js';

export interface AnalysisContext {
  url: string;
  options: AnalysisOptions;
  startTime: Date;
}

export interface AnalysisProgress {
  phase: 'setup' | 'navigation' | 'simulation' | 'processing' | 'complete';
  progress: number;
  message: string;
}

export class AnalysisDomainService {
  /**
   * Create analysis context with validated options
   */
  createAnalysisContext(
    url: string,
    interactionLevel: 'minimal' | 'default' | 'thorough' = 'default',
    deviceType: 'desktop' | 'mobile' = 'desktop'
  ): AnalysisContext {
    // Validate URL
    if (!this.isValidUrl(url)) {
      throw new Error(`Invalid URL provided: ${url}`);
    }

    // Create normalized analysis options
    const options = createAnalysisOptions(interactionLevel, deviceType);

    return {
      url: this.normalizeUrl(url),
      options,
      startTime: new Date()
    };
  }

  /**
   * Create analysis result aggregate
   */
  createAnalysisResult(
    context: AnalysisContext,
    resources: ResourceCollection,
    metadata: any
  ): AnalysisResult {
    const endTime = new Date();
    const duration = endTime.getTime() - context.startTime.getTime();

    return {
      url: context.url,
      timestamp: context.startTime.toISOString(),
      options: context.options,
      duration,
      resources,
      metadata: {
        ...metadata,
        hasFrames: metadata.hasFrames || false,
        hasServiceWorker: metadata.hasServiceWorker || false,
        pageSize: metadata.pageSize || { width: 0, height: 0 }
      }
    };
  }

  /**
   * Validate analysis prerequisites
   */
  validateAnalysisPrerequisites(context: AnalysisContext): void {
    // Check URL accessibility
    if (!this.isValidUrl(context.url)) {
      throw new Error('Invalid URL format');
    }

    // Check timeout constraints
    if (context.options.timeout < 30000) {
      throw new Error('Analysis timeout must be at least 30 seconds');
    }

    // Check interaction limits
    if (context.options.maxInteractions < 0 || context.options.maxInteractions > 20) {
      throw new Error('Max interactions must be between 0 and 20');
    }

    if (context.options.maxScrollSteps < 0 || context.options.maxScrollSteps > 10) {
      throw new Error('Max scroll steps must be between 0 and 10');
    }
  }

  /**
   * Calculate analysis complexity score
   */
  calculateComplexityScore(options: AnalysisOptions): number {
    let score = 1; // Base score

    // Interaction level complexity
    switch (options.interactionLevel) {
      case 'minimal':
        score += 1;
        break;
      case 'thorough':
        score += 5;
        break;
      default: // 'default'
        score += 3;
        break;
    }

    // Device type complexity
    if (options.deviceType === 'mobile') {
      score += 2; // Mobile simulation is more complex
    }

    // Interaction complexity
    score += Math.floor(options.maxInteractions / 2);
    score += Math.floor(options.maxScrollSteps / 2);

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Estimate analysis duration based on options
   */
  estimateAnalysisDuration(options: AnalysisOptions): number {
    const baseTime = 15000; // 15 seconds base
    const complexityScore = this.calculateComplexityScore(options);

    // Scale duration based on complexity
    return baseTime + complexityScore * 5000; // +5s per complexity point
  }

  /**
   * Generate progress updates for analysis phases
   */
  generateProgressUpdate(phase: AnalysisProgress['phase'], details?: string): AnalysisProgress {
    const phases = {
      setup: { progress: 10, message: 'Setting up browser environment' },
      navigation: { progress: 25, message: 'Navigating to target URL' },
      simulation: { progress: 70, message: 'Simulating user interactions' },
      processing: { progress: 90, message: 'Processing collected data' },
      complete: { progress: 100, message: 'Analysis complete' }
    };

    const phaseInfo = phases[phase];
    return {
      phase,
      progress: phaseInfo.progress,
      message: details || phaseInfo.message
    };
  }

  /**
   * Validate and normalize URL
   */
  private normalizeUrl(url: string): string {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Normalize URL
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  /**
   * Validate URL format and accessibility
   */
  private isValidUrl(url: string): boolean {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      const urlObj = new URL(normalizedUrl);

      // Check for valid protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Check for valid hostname
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
