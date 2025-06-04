/**
 * Website analyzer - Infrastructure service for analyzing websites
 */

import puppeteer, { Browser, LaunchOptions, Page } from 'puppeteer';
import { WebPage } from '../../domain/models/website.js';
import { Resource } from '../../domain/models/resource.js';
import { ResourceService } from '../../domain/services/resource-service.js';
import logger from '../../shared/logger.js';

// Analysis options
export interface WebsiteAnalysisOptions {
  interactionLevel: 'minimal' | 'default' | 'thorough';
  deviceType: 'desktop' | 'mobile';
  maxConcurrent?: number;
  timeout?: number;
  progressCallback?: (progress: number) => void;
}

export class WebsiteAnalyzer {
  private resourceService: ResourceService;
  private browser: Browser | null = null;

  constructor(resourceService: ResourceService) {
    this.resourceService = resourceService;
  }

  /**
   * Analyze a single webpage
   */
  async analyzePage(url: string, options: WebsiteAnalysisOptions): Promise<WebPage> {
    logger.info(`Analyzing page: ${url}`, options);

    // Launch browser if not already launched
    if (!this.browser) {
      this.browser = await this.launchBrowser(options);
    }

    const page = await this.browser.newPage();
    try {
      // Configure page based on options
      await this.configurePage(page, options);

      // Navigate to the URL
      logger.debug(`Navigating to ${url}`);
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: options.timeout || 30000
      });

      // Capture page title
      const title = await page.title();

      // Simulate user behavior based on interaction level
      await this.simulateUserBehavior(page, options.interactionLevel);

      // Collect resources
      const resources = await this.collectResources(page);
      const processedResources = this.resourceService.processResources(resources);

      // Create WebPage entity
      const webPage: WebPage = {
        url,
        title,
        resources: processedResources
      };

      logger.info(`Page analysis completed: ${url}`, {
        resources: processedResources.resourceCount,
        transferSize: Math.round(processedResources.totalTransferSize / 1024) + 'KB'
      });

      return webPage;
    } finally {
      await page.close();
    }
  }

  /**
   * Launch browser with appropriate options
   */
  private async launchBrowser(options: WebsiteAnalysisOptions): Promise<Browser> {
    const launchOptions: LaunchOptions = {
      headless: true,
      args: [
        '--disable-extensions',
        '--disable-plugins',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      ...options
    };

    logger.debug('Launching browser', launchOptions);
    return puppeteer.launch(launchOptions);
  }

  /**
   * Configure page based on device type
   */
  private async configurePage(page: Page, options: WebsiteAnalysisOptions): Promise<void> {
    if (options.deviceType === 'mobile') {
      await page.setViewport({
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      });

      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      );
    } else {
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false
      });

      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
    }
  }

  /**
   * Simulate user behavior based on interaction level
   */
  private async simulateUserBehavior(page: Page, level: string): Promise<void> {
    // We'll implement this later with proper user simulation
    // For now, just wait a bit to let everything load
    logger.debug(`Simulating user behavior with level: ${level}`);

    // Scroll down a few times to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 4);
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Collect resources loaded by the page
   */
  private async collectResources(page: Page): Promise<
    {
      url: any;
      transferSize: any;
      contentType: string;
      status: number;
    }[]
  > {
    logger.debug('Collecting page resources');

    // Get all resources using the Chrome DevTools Protocol
    const client = await page.createCDPSession();
    await client.send('Network.enable');

    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(entry => {
        const resource = entry.toJSON();
        return {
          url: resource.name,
          transferSize: resource.transferSize,
          contentType: '',
          status: 200
        };
      });
    });

    return resources;
  }

  /**
   * Close browser when finished
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
