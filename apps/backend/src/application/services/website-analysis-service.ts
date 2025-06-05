/**
 * Website analysis application service
 * Orchestrates the entire website analysis process using DDD components
 */

import { AnalysisResult } from '../../domain/models/analysis.js';
import { ResourceService } from '../../domain/services/resource-service.js';
import { AnalysisDomainService } from '../../domain/services/analysis-service.js';
import { BrowserManager } from '../../infrastructure/browser/browser-manager.js';
import { NetworkMonitor } from '../../infrastructure/browser/network-monitor.js';
import { createUserSimulator } from '../../infrastructure/browser/user-simulator.js';
import logger from '../../shared/logger.js';
import { AnalysisError } from '../../shared/errors.js';

export interface WebsiteAnalysisOptions {
  interactionLevel: 'minimal' | 'default' | 'thorough';
  deviceType: 'desktop' | 'mobile';
  timeout?: number;
}

export class WebsiteAnalysisService {
  private browserManager: BrowserManager;
  private resourceService: ResourceService;
  private analysisDomainService: AnalysisDomainService;

  constructor(resourceService: ResourceService) {
    this.browserManager = new BrowserManager();
    this.resourceService = resourceService;
    this.analysisDomainService = new AnalysisDomainService();
  }

  /**
   * Analyze a single URL
   */
  async analyzeUrl(
    url: string,
    options: Partial<WebsiteAnalysisOptions> = {}
  ): Promise<AnalysisResult> {
    const { interactionLevel = 'default', deviceType = 'desktop', timeout = 60000 } = options;

    // Create analysis context using domain service
    const context = this.analysisDomainService.createAnalysisContext(
      url,
      interactionLevel,
      deviceType
    );
    context.options.timeout = timeout;

    // Validate prerequisites
    this.analysisDomainService.validateAnalysisPrerequisites(context);

    logger.info(`Starting analysis for ${url}`, {
      interactionLevel,
      deviceType,
      estimatedDuration: this.analysisDomainService.estimateAnalysisDuration(context.options)
    });

    let page;

    try {
      // Phase 1: Setup browser environment
      await this.browserManager.launch(context.options);
      page = await this.browserManager.createPage(context.options);

      // Phase 2: Setup monitoring and simulation
      const client = await page.createCDPSession();
      const networkMonitor = new NetworkMonitor(client, page);
      const userSimulator = createUserSimulator(page, context.options);

      // Connect components
      userSimulator.setNetworkMonitor(networkMonitor);
      await networkMonitor.setupListeners();

      // Phase 3: Navigate and analyze
      await page.goto(context.url, {
        waitUntil: 'networkidle2',
        timeout: context.options.timeout
      });

      // Phase 4: Simulate user behavior
      const simulationResult = await userSimulator.simulateUserBehavior();

      // Phase 5: Process any pending cross-origin requests
      await networkMonitor.processPendingCrossOriginRequests();

      // Phase 6: Process results
      const resources = networkMonitor.getResources();
      const resourceCollection = this.resourceService.processResources(resources);

      // Phase 7: Create final result
      const pageMetadata = await page.evaluate(() => ({
        pageTitle: document.title,
        hasFrames: window.frames.length > 0,
        hasServiceWorker: 'serviceWorker' in navigator,
        pageSize: {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight
        }
      }));

      const result = this.analysisDomainService.createAnalysisResult(context, resourceCollection, {
        ...pageMetadata,
        simulation: simulationResult,
        networkActivity: networkMonitor.getTotalTransferSize()
      });

      logger.info(`Analysis completed in ${result.duration}ms for ${url}`, {
        resourceCount: resourceCollection.resourceCount,
        totalSize: resourceCollection.totalTransferSize,
        interactions: simulationResult.successfulInteractions
      });

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
