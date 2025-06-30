/**
 * Browser automation infrastructure - Puppeteer browser management
 */

import puppeteer, { Browser, LaunchOptions, Page } from 'puppeteer';
import {
  DEVICE_CONFIGURATIONS,
  DeviceConfiguration,
  PageAnalysisOptions
} from '../../domain/models/page-analysis.js';
import logger from '../../shared/logger.js';

export class BrowserManager {
  private browser: Browser | null = null;

  /**
   * Launch browser with analysis options
   */
  async launch(options: PageAnalysisOptions): Promise<Browser> {
    const launchOptions: LaunchOptions = {
      browser: 'chrome',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      headless: true,
      args: [
        '--disable-extensions',
        '--disable-plugins',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-feature=WebFontsCacheAwareTimeoutAdaption',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    };

    // Add mobile-specific optimizations
    if (options.deviceType === 'mobile') {
      launchOptions.args?.push(
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--enable-features=NetworkService,NetworkServiceLogging'
      );
    }

    this.browser = await puppeteer.launch(launchOptions);
    logger.debug('Browser launched', { deviceType: options.deviceType });

    return this.browser;
  }

  /**
   * Create and configure a new page
   */
  async createPage(options: PageAnalysisOptions): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    const page = await this.browser.newPage();
    const deviceConfig = DEVICE_CONFIGURATIONS[options.deviceType];

    await this.configurePageDevice(page, deviceConfig);

    logger.debug('Page created and configured', {
      deviceType: options.deviceType,
      viewport: deviceConfig.viewport
    });

    return page;
  }

  /**
   * Configure page device settings
   */
  private async configurePageDevice(page: Page, config: DeviceConfiguration): Promise<void> {
    await page.setViewport(config.viewport);
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.debug('Browser closed');
    }
  }

  /**
   * Check if browser is active
   */
  isActive(): boolean {
    return this.browser !== null;
  }
}
