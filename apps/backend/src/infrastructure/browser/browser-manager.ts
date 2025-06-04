/**
 * Browser automation infrastructure - Puppeteer browser management
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import {
  AnalysisOptions,
  DeviceConfiguration,
  DEVICE_CONFIGURATIONS
} from '../../domain/models/analysis.js';
import logger from '../../shared/logger.js';

export class BrowserManager {
  private browser: Browser | null = null;

  /**
   * Launch browser with analysis options
   */
  async launch(options: AnalysisOptions): Promise<Browser> {
    const launchOptions = {
      headless: true,
      args: [
        '--disable-extensions',
        '--disable-plugins',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    };

    // Add mobile-specific optimizations
    if (options.deviceType === 'mobile') {
      launchOptions.args.push(
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
  async createPage(options: AnalysisOptions): Promise<Page> {
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
    await page.setUserAgent(config.userAgent);
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
