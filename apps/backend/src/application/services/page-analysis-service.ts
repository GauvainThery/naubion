/**
 * Page analysis application service
 * Orchestrates the entire page analysis process using DDD components
 */

import { PageAnalysisOptions, PageAnalysisResult } from '../../domain/models/page-analysis.js';
import { PageAnalysisDomainService } from '../../domain/services/page-analysis-service.js';
import { ResourceService } from '../../domain/services/resource-service.js';
import { BrowserManager } from '../../infrastructure/browser/browser-manager.js';
import { NetworkMonitor } from '../../infrastructure/browser/network-monitor.js';
import { PageLoadOptimizer } from '../../infrastructure/browser/page-load-optimizer.js';
import { createUserSimulator } from '../../infrastructure/browser/user-simulator.js';
import { AnalysisError } from '../../shared/errors.js';
import logger from '../../shared/logger.js';
import { AnalysisCacheService } from './analysis-cache-service.js';
import { Co2eBytesConversionService } from './co2e-bytes-conversion-service.js';
import { GreenHostingService } from './green-hosting-service.js';
import { HumanReadableImpactService } from './human-readable-impact-service.js';

export class PageAnalysisService {
  private browserManager: BrowserManager;
  private resourceService: ResourceService;
  private pageAnalysisDomainService: PageAnalysisDomainService;
  private greenHostingService: GreenHostingService;
  private co2eBytesConversionService: Co2eBytesConversionService;
  private humanReadableImpactService: HumanReadableImpactService;
  private cacheService: AnalysisCacheService;

  constructor(
    resourceService: ResourceService,
    greenHostingService: GreenHostingService,
    co2eBytesConversionService: Co2eBytesConversionService,
    humanReadableImpactService: HumanReadableImpactService
  ) {
    this.browserManager = new BrowserManager();
    this.resourceService = resourceService;
    this.pageAnalysisDomainService = new PageAnalysisDomainService();
    this.greenHostingService = greenHostingService;
    this.co2eBytesConversionService = co2eBytesConversionService;
    this.humanReadableImpactService = humanReadableImpactService;
    this.cacheService = new AnalysisCacheService();
  }

  /**
   * Analyze a single URL
   */
  async analyzeUrl(
    url: string,
    options: Partial<PageAnalysisOptions> = {}
  ): Promise<PageAnalysisResult> {
    return this.analyzeUrlWithProgress(url, options);
  }

  /**
   * Create analysis context (delegated to domain service)
   */
  createAnalysisContext(
    url: string,
    interactionLevel: 'minimal' | 'default' | 'thorough' = 'default',
    deviceType: 'desktop' | 'mobile' = 'desktop'
  ) {
    return this.pageAnalysisDomainService.createPageAnalysisContext(
      url,
      interactionLevel,
      deviceType
    );
  }

  /**
   * Estimate analysis duration (delegated to domain service)
   */
  estimateAnalysisDuration(options: { interactionLevel: string; deviceType: string }) {
    // Create a basic analysis options object for estimation
    const context = this.pageAnalysisDomainService.createPageAnalysisContext(
      'https://example.com', // dummy URL for estimation
      options.interactionLevel as 'minimal' | 'default' | 'thorough',
      options.deviceType as 'desktop' | 'mobile'
    );
    return this.pageAnalysisDomainService.estimatePageAnalysisDuration(context.options);
  }

  /**
   * Analyze URL with progress callbacks for real-time updates
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

    // Use existing analyzeUrl method but add progress callbacks
    const {
      interactionLevel = 'default',
      deviceType = 'desktop',
      timeout = 60000 * 5
    } = analysisOptions;

    // Create analysis context using domain service
    const context = this.pageAnalysisDomainService.createPageAnalysisContext(
      url,
      interactionLevel,
      deviceType
    );
    context.options.timeout = timeout;

    // Validate prerequisites
    this.pageAnalysisDomainService.validatePageAnalysisPrerequisites(context);

    // Progress tracking
    const updateProgress = (progress: number, step: string, message?: string) => {
      if (progressCallback) {
        progressCallback(progress, step, message);
      }
    };

    // Check cache first
    updateProgress(2, 'cache', 'Checking if url analysis has already been performed recently...');

    const cachedResult = await this.cacheService.getCachedAnalysis(context.url, context.options);
    if (cachedResult) {
      logger.info('Returning cached analysis result', {
        url: context.url,
        cacheAge: Date.now() - new Date(cachedResult.timestamp).getTime()
      });
      // Still provide progress callbacks for cached results
      updateProgress(100, 'complete', 'Retrieved from cache');
      return cachedResult;
    }

    logger.info(`Starting fresh analysis for ${url}`, {
      interactionLevel,
      deviceType,
      estimatedDuration: this.pageAnalysisDomainService.estimatePageAnalysisDuration(
        context.options
      )
    });

    updateProgress(5, 'setup', 'Setting up browser environment...');

    let page;

    try {
      // Phase 1: Setup browser environment
      updateProgress(8, 'setup', 'Launching browser instance...');
      await this.browserManager.launch(context.options);

      updateProgress(12, 'setup', 'Creating browser page...');
      page = await this.browserManager.createPage(context.options);

      updateProgress(18, 'navigation', 'Navigating to target website...');

      // Phase 2: Setup monitoring and simulation with optimization
      const client = await page.createCDPSession();
      const networkMonitor = new NetworkMonitor(client, page);
      const userSimulator = createUserSimulator(page, context.options);
      const pageLoadOptimizer = new PageLoadOptimizer({
        waitForImages: true, // Important for accurate size measurement
        waitForFonts: true, // Important for accurate size measurement
        waitForJS: true,
        maxLoadTime: context.options.timeout * 0.8,
        skipNonCriticalResources: false
      });

      // Connect components
      userSimulator.setNetworkMonitor(networkMonitor);
      userSimulator.setProgressCallback(updateProgress);
      await networkMonitor.setupListeners();

      updateProgress(25, 'navigation', 'Loading page and initial resources...');

      // Phase 3: Navigate and analyze with optimized loading
      pageLoadOptimizer.setProgressCallback(updateProgress);
      await pageLoadOptimizer.optimizePageLoad(page, context.url);

      updateProgress(40, 'simulation', 'Starting user behavior simulation...');

      // Phase 4: Simulate user behavior
      const simulationResult = await userSimulator.simulateUserBehavior();

      updateProgress(65, 'processing', 'Processing collected resources...');

      // Phase 5: Process any pending cross-origin requests
      updateProgress(68, 'processing', 'Processing cross-origin requests...');
      await networkMonitor.processPendingCrossOriginRequests();

      // Phase 6: Process results
      updateProgress(75, 'processing', 'Categorizing resources by type...');
      const resources = networkMonitor.getResources();
      const resourceCollection = this.resourceService.processResources(resources);

      updateProgress(80, 'green-hosting', 'Assessing green hosting impact...');

      // Phase 7: Green hosting assessment
      const greenHostingResult = await this.greenHostingService.assessGreenHosting(url);

      updateProgress(88, 'co2e-conversion', 'Converting bytes into gCO₂e...');

      // Phase 8: Convert bytes into gCO2e
      const co2eBytesConverisonResults = this.co2eBytesConversionService.convertBytesIntoCo2e({
        bytes: resourceCollection.totalTransferSize,
        isGreenHosted: greenHostingResult.green
      });

      updateProgress(94, 'impact-calculation', 'Creating human-readable impact report...');

      // Phase 9: Create human-readable impact report
      const humanReadableImpact = this.humanReadableImpactService.convertToHumanReadableImpact({
        gCo2e: co2eBytesConverisonResults.value // always in g for now but be careful here!!
      });

      updateProgress(98, 'finalizing', 'Finalizing analysis results...');

      // Phase 10: Create final result
      const pageMetadata = await page.evaluate(() => ({
        pageTitle: document.title,
        hasFrames: window.frames.length > 0,
        hasServiceWorker: 'serviceWorker' in navigator,
        pageSize: {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight
        }
      }));

      const result = this.pageAnalysisDomainService.createPageAnalysisResult(
        context,
        resourceCollection,
        greenHostingResult,
        co2eBytesConverisonResults.value, // always in g for now but be careful here!!
        humanReadableImpact,
        {
          ...pageMetadata,
          simulation: simulationResult,
          networkActivity: networkMonitor.getTotalTransferSize()
        }
      );

      logger.info(`Analysis completed in ${result.duration}ms for ${url}`, {
        resourceCount: resourceCollection.resourceCount,
        totalSize: resourceCollection.totalTransferSize,
        interactions: simulationResult.successfulInteractions
      });

      // Cache the result for future use
      await this.cacheService.cacheAnalysis(result);

      updateProgress(100, 'complete', 'Analysis completed successfully');

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Analysis failed for ${url}`, { error: errorMessage });
      throw new AnalysisError(`Failed to analyze ${url}: ${errorMessage}`, url);
    } finally {
      // Clean up resources
      if (this.browserManager.isActive()) {
        await this.browserManager.close();
      }
    }
  }
}
