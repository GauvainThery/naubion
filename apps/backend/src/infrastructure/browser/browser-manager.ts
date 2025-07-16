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

    // Monitor memory usage - use more realistic thresholds
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    // Get the actual memory limit (default is usually around 1.4GB for 64-bit Node.js)
    const maxHeapMB = this.getMaxHeapSize();
    const memoryPressureThreshold = maxHeapMB * 0.85; // 85% of actual limit

    if (heapUsedMB > memoryPressureThreshold) {
      logger.warn('High memory usage detected', {
        heapUsedMB,
        heapTotalMB,
        maxHeapMB,
        memoryPressureThreshold: Math.round(memoryPressureThreshold),
        poolSize: this.browsers.size,
        utilizationPercent: Math.round((heapUsedMB / maxHeapMB) * 100)
      });

      // Trigger more aggressive cleanup when under memory pressure
      await this.cleanupIdleBrowsers();

      // Force garbage collection if available (in production)
      if (global.gc) {
        global.gc();
        logger.debug('Forced garbage collection due to memory pressure');
      }

      // In very low memory situations, close unused browsers immediately
      if (heapUsedMB > maxHeapMB * 0.95) {
        await this.forceCleanupUnusedBrowsers();
      }
    }

    // Clean up idle browsers
    await this.cleanupIdleBrowsers();

    // Log memory stats periodically for monitoring (every 10th call)
    if (Math.random() < 0.1) {
      logger.debug('Memory usage stats', {
        heapUsedMB,
        heapTotalMB,
        maxHeapMB,
        utilizationPercent: Math.round((heapUsedMB / maxHeapMB) * 100),
        poolSize: this.browsers.size,
        memoryPressureThreshold: Math.round(memoryPressureThreshold)
      });
    }

    // Check if we have an available browser
    const pooledBrowser = this.browsers.get(poolKey);
    if (pooledBrowser && !pooledBrowser.inUse && pooledBrowser.browser.connected) {
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

  private async forceCleanupUnusedBrowsers(): Promise<void> {
    const toRemove: string[] = [];

    // In critical memory situations, close ALL unused browsers immediately
    for (const [key, pooledBrowser] of this.browsers.entries()) {
      if (!pooledBrowser.inUse) {
        toRemove.push(key);
      }
    }

    if (toRemove.length > 0) {
      logger.warn('Force closing unused browsers due to critical memory pressure', {
        browsersToClose: toRemove.length
      });

      for (const key of toRemove) {
        const pooledBrowser = this.browsers.get(key);
        if (pooledBrowser) {
          try {
            await pooledBrowser.browser.close();
          } catch (error) {
            logger.debug('Error force closing browser', { error });
          }
          this.browsers.delete(key);
        }
      }
    }
  }

  private async createOptimizedBrowser(options: PageAnalysisOptions): Promise<Browser> {
    const userDataDir = `${process.env.CHROME_CONFIG_DIR || '/tmp/chrome'}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate memory limits based on available heap
    const maxHeapMB = this.getMaxHeapSize();
    const chromeMemoryLimit = Math.max(64, Math.floor(maxHeapMB * 0.4)); // 40% of heap for Chrome

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

        // Memory optimizations - FIXED: Remove conflicting Node.js flag
        '--memory-pressure-off',
        `--max-old-space-size=${chromeMemoryLimit}`, // Chrome memory limit
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',

        // Network optimizations - Add better network handling
        '--disable-background-networking',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--disable-hang-monitor',
        '--disable-domain-reliability', // Reduce network overhead
        '--disable-background-networking',

        // Stability improvements
        '--disable-ipc-flooding-protection',
        '--disable-prompt-on-repost',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',

        // Low memory environment optimizations
        '--aggressive-cache-discard',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-features=IPH_DesktopTabGroupsNewTabButton',
        '--disable-features=MediaRouter',
        '--disable-blink-features=AutomationControlled', // Avoid detection

        // Anti-bot detection measures
        '--disable-blink-features=AutomationControlled',
        '--exclude-switches=enable-automation',
        '--disable-extensions-http-throttling',

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

    // Add timeout for browser launch to prevent hanging
    const launchTimeout = 30000; // 30 seconds
    const browserPromise = puppeteer.launch(launchOptions);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Browser launch timeout')), launchTimeout);
    });

    const browser = await Promise.race([browserPromise, timeoutPromise]);

    // Set a realistic User Agent to avoid bot detection
    const pages = await browser.pages();
    const defaultPage = pages[0];
    if (defaultPage) {
      await defaultPage.setUserAgent(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
    }

    // Verify browser is working
    const version = await browser.version();
    logger.debug('Browser launched successfully', {
      deviceType: options.deviceType,
      version: version.substring(0, 50), // Truncate long version strings
      userDataDir,
      memoryLimit: `${chromeMemoryLimit}MB`
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
    const totalMemoryMB = this.getMaxHeapSize();

    // For very low memory environments (< 512MB), be much more conservative
    if (totalMemoryMB <= 512) {
      logger.info('Low memory environment detected, using minimal browser pool', {
        totalMemoryMB,
        poolSize: 2
      });
      return 2; // Only 2 browsers for very low memory
    }

    // Estimate memory usage more accurately for production
    // Chrome in headless mode typically uses 100-200MB, but can spike higher
    // Be conservative in Docker environments
    const estimatedInstanceMemory = totalMemoryMB <= 1000 ? 200 : 150; // More conservative for small containers
    const nodeOverhead = Math.max(100, totalMemoryMB * 0.25); // Reserve 25% for Node.js
    const availableForBrowsers = totalMemoryMB - nodeOverhead;
    const calculatedSize = Math.floor(availableForBrowsers / estimatedInstanceMemory);

    // Ensure we have at least 1 and at most 3 browsers (reduced max for production)
    const optimalSize = Math.max(1, Math.min(3, calculatedSize));

    logger.info('Calculated optimal browser pool size', {
      totalMemoryMB,
      availableForBrowsers,
      estimatedInstanceMemory,
      nodeOverhead,
      calculatedSize: optimalSize
    });

    return optimalSize;
  }

  private getMaxHeapSize(): number {
    // Check if max-old-space-size is set via NODE_OPTIONS
    const nodeOptions = process.env.NODE_OPTIONS || '';
    const maxOldSpaceMatch = nodeOptions.match(/--max-old-space-size=(\d+)/);

    if (maxOldSpaceMatch) {
      return parseInt(maxOldSpaceMatch[1], 10);
    }

    // Check V8 flags (alternative way to set memory limit)
    const v8Options = process.env.V8_OPTIONS || '';
    const v8MaxOldSpaceMatch = v8Options.match(/--max-old-space-size=(\d+)/);

    if (v8MaxOldSpaceMatch) {
      return parseInt(v8MaxOldSpaceMatch[1], 10);
    }

    // Default Node.js heap size limits based on architecture
    // For 64-bit systems, default is around 1.4GB (1400MB)
    // For 32-bit systems, default is around 700MB
    const is64Bit = process.arch === 'x64' || process.arch === 'arm64';
    return is64Bit ? 1400 : 700;
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

      // Enhanced connection check with recovery
      if (!this.browser.connected) {
        logger.warn('Browser disconnected, attempting to reconnect...');
        try {
          // Try to get a new browser from the pool
          this.browser = await this.browserPool.getBrowser(options);
          this.isPooledBrowser = true;
        } catch (recoveryError) {
          logger.error('Browser recovery failed', {
            error: recoveryError instanceof Error ? recoveryError.message : String(recoveryError)
          });
          throw new Error('Browser is not connected and recovery failed');
        }
      }

      const page = await this.browser.newPage();

      // Set realistic User Agent to avoid bot detection
      await page.setUserAgent(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Basic page configuration
      const deviceConfig = DEVICE_CONFIGURATIONS[options.deviceType];
      await this.configurePageOptimized(page, deviceConfig, options);

      // Set more conservative timeouts to avoid hanging
      const conservativeTimeout = Math.min(options.timeout || 60000, 60000); // Cap at 60s
      page.setDefaultNavigationTimeout(conservativeTimeout);
      page.setDefaultTimeout(conservativeTimeout);

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
