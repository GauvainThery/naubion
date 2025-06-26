/**
 * Enhanced Page Analysis Service with Database Caching
 * This is a wrapper that adds caching capabilities to the existing PageAnalysisService
 */

import { PageAnalysisOptions, PageAnalysisResult } from '../../domain/models/page-analysis.js';
import { PageAnalysisService } from './page-analysis-service.js';
import { AnalysisCacheService } from './analysis-cache-service.js';
import logger from '../../shared/logger.js';

export class CachedPageAnalysisService {
  private analysisService: PageAnalysisService;
  private cacheService: AnalysisCacheService;

  constructor(analysisService: PageAnalysisService) {
    this.analysisService = analysisService;
    this.cacheService = new AnalysisCacheService();
  }

  /**
   * Analyze URL with caching support
   */
  async analyzeUrl(
    url: string,
    options: Partial<PageAnalysisOptions> = {}
  ): Promise<PageAnalysisResult> {
    const { interactionLevel = 'default', deviceType = 'desktop' } = options;

    // Create analysis context to get normalized options
    const context = this.analysisService.createAnalysisContext(url, interactionLevel, deviceType);

    // Check cache first
    const cachedResult = await this.cacheService.getCachedAnalysis(context.url, context.options);
    if (cachedResult) {
      logger.info('Returning cached analysis result', {
        url: context.url,
        cacheAge: Date.now() - new Date(cachedResult.timestamp).getTime()
      });
      return cachedResult;
    }

    // Perform fresh analysis
    logger.info('Cache miss - performing fresh analysis', { url: context.url });
    const result = await this.analysisService.analyzeUrl(url, options);

    // Cache the result
    await this.cacheService.cacheAnalysis(result);

    return result;
  }

  /**
   * Analyze URL with progress and caching support
   */
  async analyzeUrlWithProgress(
    url: string,
    options: Partial<
      PageAnalysisOptions & {
        progressCallback?: (progress: number, step: string, message?: string) => void;
      }
    > = {}
  ): Promise<PageAnalysisResult> {
    const { progressCallback, ...analysisOptions } = options;
    const { interactionLevel = 'default', deviceType = 'desktop' } = analysisOptions;

    // Create analysis context to get normalized options
    const context = this.analysisService.createAnalysisContext(url, interactionLevel, deviceType);

    // Check cache first
    const cachedResult = await this.cacheService.getCachedAnalysis(context.url, context.options);
    if (cachedResult) {
      logger.info('Returning cached analysis result', {
        url: context.url,
        cacheAge: Date.now() - new Date(cachedResult.timestamp).getTime()
      });

      // Simulate progress for cached results
      if (progressCallback) {
        progressCallback(25, 'cache-lookup', 'Found cached analysis...');
        progressCallback(75, 'cache-retrieval', 'Retrieving cached data...');
        progressCallback(100, 'complete', 'Analysis complete (from cache)');
      }

      return cachedResult;
    }

    // Perform fresh analysis with progress
    logger.info('Cache miss - performing fresh analysis with progress', { url: context.url });
    const result = await this.analysisService.analyzeUrlWithProgress(url, options);

    // Cache the result
    await this.cacheService.cacheAnalysis(result);

    return result;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    enabled: boolean;
    ttlHours: number;
    totalAnalyses: number;
    uniqueUrls: number;
    oldestAnalysis: Date | null;
    newestAnalysis: Date | null;
  }> {
    return await this.cacheService.getCacheStats();
  }

  /**
   * Clean up old cached analyses
   */
  async cleanupCache(olderThanDays: number = 30): Promise<number> {
    return await this.cacheService.cleanupOldCache(olderThanDays);
  }

  /**
   * Check if analysis result exists in cache
   */
  async hasCachedAnalysis(
    url: string,
    options: Partial<PageAnalysisOptions> = {}
  ): Promise<boolean> {
    const { interactionLevel = 'default', deviceType = 'desktop' } = options;
    const context = this.analysisService.createAnalysisContext(url, interactionLevel, deviceType);

    const cachedResult = await this.cacheService.getCachedAnalysis(context.url, context.options);
    return cachedResult !== null;
  }

  /**
   * Get recent analyses for a URL
   */
  async getRecentAnalyses(url: string, limit: number = 10): Promise<PageAnalysisResult[]> {
    return await this.cacheService.getRecentAnalyses(url, limit);
  }

  /**
   * Estimate analysis duration
   */
  estimateAnalysisDuration(options: { interactionLevel: string; deviceType: string }): number {
    return this.analysisService.estimateAnalysisDuration(options);
  }

  /**
   * Create analysis context (delegated to underlying service)
   */
  createAnalysisContext(
    url: string,
    interactionLevel: 'minimal' | 'default' | 'thorough' = 'default',
    deviceType: 'desktop' | 'mobile' = 'desktop'
  ) {
    return this.analysisService.createAnalysisContext(url, interactionLevel, deviceType);
  }

  /**
   * Check if caching is enabled
   */
  isCacheEnabled(): boolean {
    return this.cacheService.isCacheEnabled();
  }

  /**
   * Get cache TTL in hours
   */
  getCacheTTL(): number {
    return this.cacheService.getCacheTTL();
  }
}
