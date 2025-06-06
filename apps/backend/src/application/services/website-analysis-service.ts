/**
 * Full Website Analysis Application Service
 * Orchestrates multi-page website analysis using DDD components
 */

import { Website, Page } from '../../domain/models/website.js';
import { PageAnalysisResult } from '../../domain/models/analysis/page-analysis.js';
import { WebsiteService } from '../../domain/services/website-service.js';
import {
  WebsiteAnalysisContext,
  WebsiteAnalysisDomainService
} from '../../domain/services/analysis/website-analysis-service.js';
import { PageAnalysisService } from './page-analysis-service.js';
import logger from '../../shared/logger.js';
import { AnalysisError } from '../../shared/errors.js';
import {
  WebsiteAnalysisOptions,
  WebsiteAnalysisResult
} from '../../domain/models/analysis/website-analysis.js';

export class WebsiteAnalysisService {
  private websiteAnalysisService: PageAnalysisService;
  private websiteService: WebsiteService;
  private websiteAnalysisDomainService: WebsiteAnalysisDomainService;

  constructor(websiteAnalysisService: PageAnalysisService, websiteService: WebsiteService) {
    this.websiteAnalysisService = websiteAnalysisService;
    this.websiteService = websiteService;
    this.websiteAnalysisDomainService = new WebsiteAnalysisDomainService();
  }

  /**
   * Analyze entire website with user behavior patterns and device distribution
   */
  async analyzeWebsite(
    url: string,
    options: Partial<WebsiteAnalysisOptions> = {}
  ): Promise<WebsiteAnalysisResult> {
    const startTime = new Date();

    const {
      interactionLevel = 'default',
      desktopMobileRatio = 50,
      monthlyVisits = 1000,
      timeout = 1200000,
      maxPagesToAnalyze = 5
    } = options;

    // Create analysis context using domain service
    const context = this.websiteAnalysisDomainService.createWebsiteAnalysisContext(
      url,
      interactionLevel,
      desktopMobileRatio,
      monthlyVisits
    );
    context.options.timeout = timeout;

    // Validate prerequisites
    this.websiteAnalysisDomainService.validateWebsiteAnalysisPrerequisites(context);

    logger.info(`Starting website analysis for ${url}`, {
      interactionLevel,
      desktopMobileRatio,
      monthlyVisits,
      estimatedDuration: this.websiteAnalysisDomainService.estimateWebsiteAnalysisDuration(
        context,
        maxPagesToAnalyze
      )
    });

    try {
      // Step 1: Discover pages to analyze
      const pagesToAnalyze = await this.discoverPagesToAnalyze(url, maxPagesToAnalyze);

      logger.info(`Discovered ${pagesToAnalyze.length} pages to analyze`, {
        pages: pagesToAnalyze
      });

      // Step 2: Analyze pages with both desktop and mobile configurations
      const pageAnalysisResults = await this.analyzeMultiplePages(
        pagesToAnalyze,
        interactionLevel,
        timeout
      );

      // Step 3: Aggregate website metrics
      const website = this.aggregateWebsiteMetrics(pageAnalysisResults);

      // Step 4: Create final analysis result
      const result = this.websiteAnalysisDomainService.createWebsiteAnalysisResult(
        context,
        pageAnalysisResults,
        startTime
      );

      logger.info(`Website analysis completed in ${result.duration}ms`, {
        domain: website.domain,
        totalPages: website.totalPages,
        totalResourceSize: website.totalResourceSize
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Website analysis failed for ${url}`, { error: errorMessage });
      throw new AnalysisError(`Failed to analyze website ${url}: ${errorMessage}`, url);
    }
  }

  /**
   * Estimate website analysis duration
   */
  estimateAnalysisDuration(context: WebsiteAnalysisContext, maxPagesToAnalyze: number = 5): number {
    return this.websiteAnalysisDomainService.estimateWebsiteAnalysisDuration(
      context,
      maxPagesToAnalyze
    );
  }

  /**
   * Discover pages to analyze (simplified implementation)
   * In a real implementation, this could use sitemap parsing, crawling, etc.
   */
  private async discoverPagesToAnalyze(baseUrl: string, maxPages: number): Promise<string[]> {
    // For now, return the main page and common subpages
    // In a full implementation, this would crawl the site or parse sitemap

    const urlObj = new URL(baseUrl);
    const baseHost = urlObj.origin;

    const commonPaths = [
      '', // Homepage
      '/about',
      '/contact',
      '/services',
      '/products',
      '/blog'
    ];

    const pagesToAnalyze = [baseUrl]; // Always include the main page

    // Add common subpages up to maxPages
    for (let i = 1; i < Math.min(maxPages, commonPaths.length); i++) {
      const path = commonPaths[i];
      const fullUrl = path ? `${baseHost}${path}` : baseHost;
      if (fullUrl !== baseUrl) {
        pagesToAnalyze.push(fullUrl);
      }
    }

    return pagesToAnalyze.slice(0, maxPages);
  }

  /**
   * Analyze multiple pages with different device configurations
   */
  private async analyzeMultiplePages(
    pages: string[],
    interactionLevel: 'minimal' | 'default' | 'thorough',
    timeout: number,
    progressCallback?: (progress: number, currentPage: number, totalPages: number) => void
  ): Promise<PageAnalysisResult[]> {
    const results: PageAnalysisResult[] = [];
    const totalAnalyses = pages.length * 2; // Desktop + Mobile for each page
    let currentAnalysis = 0;

    for (let i = 0; i < pages.length; i++) {
      const url = pages[i];

      // Analyze with desktop configuration
      try {
        const desktopResult = await this.websiteAnalysisService.analyzeUrl(url, {
          interactionLevel,
          deviceType: 'desktop',
          timeout: timeout / totalAnalyses // Distribute timeout across all analyses
        });
        results.push(desktopResult);
        currentAnalysis++;

        if (progressCallback) {
          progressCallback((currentAnalysis / totalAnalyses) * 100, i + 1, pages.length);
        }
      } catch (error) {
        logger.warn(`Failed to analyze ${url} with desktop configuration`, { error });
      }

      // Analyze with mobile configuration
      try {
        const mobileResult = await this.websiteAnalysisService.analyzeUrl(url, {
          interactionLevel,
          deviceType: 'mobile',
          timeout: timeout / totalAnalyses
        });
        results.push(mobileResult);
        currentAnalysis++;

        if (progressCallback) {
          progressCallback((currentAnalysis / totalAnalyses) * 100, i + 1, pages.length);
        }
      } catch (error) {
        logger.warn(`Failed to analyze ${url} with mobile configuration`, { error });
      }
    }

    if (results.length === 0) {
      throw new Error('Failed to analyze any pages');
    }

    return results;
  }

  /**
   * Aggregate multiple page analysis results into a website
   */
  private aggregateWebsiteMetrics(pageAnalysisResults: PageAnalysisResult[]): Website {
    // Group results by URL (desktop and mobile results for the same page)
    const pageGroups = new Map<string, PageAnalysisResult[]>();

    for (const result of pageAnalysisResults) {
      const url = result.url;
      if (!pageGroups.has(url)) {
        pageGroups.set(url, []);
      }
      pageGroups.get(url)!.push(result);
    }

    // Create WebPage entities by averaging results for each URL
    const webPages: Page[] = [];

    for (const [url, results] of pageGroups) {
      // Use the first result for basic metadata, average the resources
      const firstResult = results[0];

      // Calculate average resource metrics across device types
      const avgTotalTransferSize =
        results.reduce((sum, r) => sum + r.resources.totalTransferSize, 0) / results.length;
      const avgResourceCount =
        results.reduce((sum, r) => sum + r.resources.resourceCount, 0) / results.length;

      // Merge resource type breakdowns (average)
      const avgSizeByType = {
        html: results.reduce((sum, r) => sum + r.resources.sizeByType.html, 0) / results.length,
        css: results.reduce((sum, r) => sum + r.resources.sizeByType.css, 0) / results.length,
        js: results.reduce((sum, r) => sum + r.resources.sizeByType.js, 0) / results.length,
        media: results.reduce((sum, r) => sum + r.resources.sizeByType.media, 0) / results.length,
        font: results.reduce((sum, r) => sum + r.resources.sizeByType.font, 0) / results.length,
        other: results.reduce((sum, r) => sum + r.resources.sizeByType.other, 0) / results.length
      };

      const webPage: Page = {
        url,
        title: firstResult.metadata.pageTitle || url,
        resources: {
          totalTransferSize: avgTotalTransferSize,
          resourceCount: Math.round(avgResourceCount),
          sizeByType: avgSizeByType,
          resources: [] // We don't need individual resources for website-level analysis
        }
      };

      webPages.push(webPage);
    }

    // Use the website service to aggregate final metrics
    return this.websiteService.aggregateWebsiteMetrics(webPages);
  }

  /**
   * Create analysis context (delegated to domain service)
   */
  createAnalysisContext(
    url: string,
    interactionLevel: 'minimal' | 'default' | 'thorough' = 'default',
    desktopMobileRatio: number = 50,
    monthlyVisits: number = 1000
  ) {
    return this.websiteAnalysisDomainService.createWebsiteAnalysisContext(
      url,
      interactionLevel,
      desktopMobileRatio,
      monthlyVisits
    );
  }
}
