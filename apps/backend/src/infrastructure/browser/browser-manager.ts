/**
 * Browser automation infrastructure - Puppeteer browser management
 *
 * Alpine Linux Configuration:
 * - Uses system-installed Chromium from Alpine packages
 * - Configured for Docker/Alpine environment with appropriate flags
 * - Follows Puppeteer Alpine troubleshooting guide: https://pptr.dev/troubleshooting#running-on-alpine
 *
 */

import puppeteer, { Browser, LaunchOptions, Page } from 'puppeteer';
import {
  DEVICE_CONFIGURATIONS,
  DeviceConfiguration,
  PageAnalysisOptions
} from '../../domain/models/page-analysis.js';
import logger from '../../shared/logger.js';

// Global browser pool for reuse across analyses
class BrowserPool {
  private static instance: BrowserPool;
  private browsers: Map<string, { browser: Browser; lastUsed: number; inUse: boolean }> = new Map();
  private readonly maxPoolSize = this.calculateOptimalPoolSize();
  private readonly maxIdleTime = 30000; // 30 seconds

  static getInstance(): BrowserPool {
    if (!BrowserPool.instance) {
      BrowserPool.instance = new BrowserPool();
    }
    return BrowserPool.instance;
  }

  async getBrowser(options: PageAnalysisOptions): Promise<Browser> {
    const poolKey = `${options.deviceType}_${options.interactionLevel}`;

    // Monitor memory usage
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > memUsage.heapTotal * 0.9) {
      logger.warn('High memory usage detected', {
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        poolSize: this.browsers.size
      });
    }

    // Clean up idle browsers
    await this.cleanupIdleBrowsers();

    // Check if we have an available browser
    const pooledBrowser = this.browsers.get(poolKey);
    if (pooledBrowser && !pooledBrowser.inUse && pooledBrowser.browser.isConnected()) {
      pooledBrowser.inUse = true;
      pooledBrowser.lastUsed = Date.now();
      logger.debug('Reusing pooled browser', { poolKey });
      return pooledBrowser.browser;
    }

    // Create new browser if pool has space
    if (this.browsers.size < this.maxPoolSize) {
      const browser = await this.createOptimizedBrowser(options);
      this.browsers.set(poolKey, {
        browser,
        lastUsed: Date.now(),
        inUse: true
      });
      logger.debug('Created new pooled browser', { poolKey, poolSize: this.browsers.size });
      return browser;
    }

    // Pool is full, create temporary browser
    logger.debug('Pool full, creating temporary browser', { poolKey });
    return await this.createOptimizedBrowser(options);
  }

  releaseBrowser(browser: Browser): void {
    for (const [key, pooledBrowser] of this.browsers.entries()) {
      if (pooledBrowser.browser === browser) {
        pooledBrowser.inUse = false;
        pooledBrowser.lastUsed = Date.now();
        logger.debug('Released browser back to pool', { poolKey: key });
        return;
      }
    }
  }

  private async cleanupIdleBrowsers(): Promise<void> {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [key, pooledBrowser] of this.browsers.entries()) {
      if (!pooledBrowser.inUse && now - pooledBrowser.lastUsed > this.maxIdleTime) {
        toRemove.push(key);
      }
    }

    for (const key of toRemove) {
      const pooledBrowser = this.browsers.get(key);
      if (pooledBrowser) {
        try {
          await pooledBrowser.browser.close();
        } catch (error) {
          logger.debug('Error closing idle browser', { error });
        }
        this.browsers.delete(key);
        logger.debug('Removed idle browser from pool', { poolKey: key });
      }
    }
  }

  private async createOptimizedBrowser(options: PageAnalysisOptions): Promise<Browser> {
    const userDataDir = `${process.env.CHROME_CONFIG_DIR || '/tmp/chrome'}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const launchOptions: LaunchOptions = {
      // Use system Chromium from Alpine package
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      headless: true,
      // Optimized args for performance and reliability
      args: [
        // Essential Docker/Alpine flags
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',

        // Performance optimizations
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--disable-features=TranslateUI,VizDisplayCompositor,Translate',

        // Memory optimizations
        '--memory-pressure-off',
        '--max_old_space_size=512',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',

        // Network optimizations
        '--disable-background-networking',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--disable-hang-monitor',

        // Stability improvements
        '--disable-ipc-flooding-protection',
        '--disable-prompt-on-repost',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',

        // Directory settings
        `--user-data-dir=${userDataDir}`,
        `--disk-cache-dir=${process.env.CHROME_CACHE_DIR || '/tmp/chrome-cache'}`,

        // Disable unnecessary features
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-crashpad',
        '--disable-logging',
        '--silent'
      ]
    };

    // Add device-specific optimizations
    if (options.deviceType === 'mobile') {
      launchOptions.args?.push('--enable-features=NetworkService', '--force-device-scale-factor=1');
    }

    const browser = await puppeteer.launch(launchOptions);

    // Verify browser is working
    const version = await browser.version();
    logger.debug('Browser launched successfully', {
      deviceType: options.deviceType,
      version: version.substring(0, 50), // Truncate long version strings
      userDataDir
    });

    return browser;
  }

  async closeAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [key, pooledBrowser] of this.browsers.entries()) {
      promises.push(
        pooledBrowser.browser.close().catch(error => {
          logger.debug('Error closing pooled browser', { error, key });
        })
      );
    }

    await Promise.allSettled(promises);
    this.browsers.clear();
    logger.debug('Closed all pooled browsers');
  }

  private calculateOptimalPoolSize(): number {
    // Adjust pool size based on available memory
    const totalMemoryMB = process.env.NODE_OPTIONS?.includes('--max-old-space-size=')
      ? parseInt(process.env.NODE_OPTIONS.match(/--max-old-space-size=(\d+)/)?.[1] || '512')
      : 512;

    // Estimate ~150MB per Chrome instance + 100MB for Node.js overhead
    const estimatedInstanceMemory = 150;
    const nodeOverhead = 100;
    const availableForBrowsers = totalMemoryMB - nodeOverhead;
    const calculatedSize = Math.floor(availableForBrowsers / estimatedInstanceMemory);

    // Ensure we have at least 1 and at most 5 browsers
    const optimalSize = Math.max(1, Math.min(5, calculatedSize));

    logger.info('Calculated optimal browser pool size', {
      totalMemoryMB,
      availableForBrowsers,
      estimatedInstanceMemory,
      calculatedSize: optimalSize
    });

    return optimalSize;
  }
}

export class BrowserManager {
  private browser: Browser | null = null;
  private browserPool = BrowserPool.getInstance();
  private isPooledBrowser = false;

  /**
   * Launch browser with analysis options - now uses browser pooling
   */
  async launch(options: PageAnalysisOptions): Promise<Browser> {
    try {
      this.browser = await this.browserPool.getBrowser(options);
      this.isPooledBrowser = true;

      logger.debug('Browser ready for analysis', {
        deviceType: options.deviceType,
        interactionLevel: options.interactionLevel
      });

      return this.browser;
    } catch (error) {
      logger.error('Failed to launch browser', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Create and configure a new page - optimized for speed and reliability
   */
  async createPage(options: PageAnalysisOptions): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    try {
      logger.debug('Creating new browser page...');

      // Quick connection check
      if (!this.browser.connected) {
        throw new Error('Browser is not connected');
      }

      const page = await this.browser.newPage();

      // Basic page configuration
      const deviceConfig = DEVICE_CONFIGURATIONS[options.deviceType];
      await this.configurePageOptimized(page, deviceConfig, options);

      // Set timeouts
      page.setDefaultNavigationTimeout(options.timeout || 60000 * 3);
      page.setDefaultTimeout(60000 * 3);

      // Performance optimizations
      await page.setRequestInterception(false);

      // Enable JavaScript selectively for analysis
      await page.setJavaScriptEnabled(true);

      logger.debug('Page created and configured successfully', {
        deviceType: options.deviceType,
        viewport: deviceConfig.viewport,
        timeout: options.timeout
      });

      return page;
    } catch (error) {
      logger.error('Failed to create page', {
        error: error instanceof Error ? error.message : String(error),
        deviceType: options.deviceType,
        browserConnected: this.browser?.connected || false
      });
      throw error;
    }
  }

  /**
   * Configure page device settings - streamlined for performance
   */
  private async configurePageOptimized(
    page: Page,
    config: DeviceConfiguration,
    options: PageAnalysisOptions
  ): Promise<void> {
    try {
      // Quick check if page is still valid
      if (page.isClosed()) {
        throw new Error('Cannot configure device settings - page is closed');
      }

      // Simplified viewport configuration
      const viewportConfig = {
        width: config.viewport.width,
        height: config.viewport.height,
        deviceScaleFactor: config.viewport.deviceScaleFactor,
        isMobile: options.deviceType === 'mobile',
        hasTouch: options.deviceType === 'mobile'
      };

      // Set viewport with single attempt - let it fail fast if there are issues
      await page.setViewport(viewportConfig);

      logger.debug('Page device configuration completed', {
        viewport: viewportConfig,
        deviceType: options.deviceType
      });
    } catch (error) {
      logger.error('Failed to configure page device settings', {
        error: error instanceof Error ? error.message : String(error),
        deviceType: options.deviceType
      });
      throw error;
    }
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      if (this.isPooledBrowser) {
        // Return to pool instead of closing
        this.browserPool.releaseBrowser(this.browser);
        logger.debug('Browser returned to pool');
      } else {
        // Close temporary browser
        await this.browser.close();
        logger.debug('Temporary browser closed');
      }

      this.browser = null;
      this.isPooledBrowser = false;
    }
  }

  /**
   * Check if browser is active
   */
  isActive(): boolean {
    return this.browser !== null;
  }

  /**
   * Get browser pool statistics
   */
  getPoolStats(): { poolSize: number; activeBrowsers: number } {
    const poolSize = this.browserPool['browsers'].size;
    const activeBrowsers = Array.from(this.browserPool['browsers'].values()).filter(
      b => b.inUse
    ).length;

    return { poolSize, activeBrowsers };
  }
}
