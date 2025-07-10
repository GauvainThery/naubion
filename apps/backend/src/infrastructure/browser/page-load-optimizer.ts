/**
 * Page Load Optimizer - Optimizes page loading for faster analysis
 */

import { Page } from 'puppeteer';
import logger from '../../shared/logger.js';

export interface PageLoadOptions {
  waitForImages: boolean;
  waitForFonts: boolean;
  waitForJS: boolean;
  maxLoadTime: number;
  skipNonCriticalResources: boolean;
}

export class PageLoadOptimizer {
  private progressCallback?: (progress: number, step: string, message?: string) => void;

  constructor(private options: PageLoadOptions) {}

  setProgressCallback(callback: (progress: number, step: string, message?: string) => void): void {
    this.progressCallback = callback;
  }

  async optimizePageLoad(page: Page, url: string): Promise<void> {
    const startTime = Date.now();

    try {
      this.progressCallback?.(28, 'navigation', 'Navigating to page...');

      // Navigate with optimized wait conditions
      await this.navigateWithOptimizedWait(page, url);

      this.progressCallback?.(35, 'navigation', 'Waiting for critical resources...');

      // Wait for critical resources
      await this.waitForCriticalResources(page);

      const loadTime = Date.now() - startTime;
      logger.debug('Page load optimization completed', {
        url,
        loadTime
      });
    } catch (error) {
      logger.error('Page load optimization failed', {
        url,
        error: error instanceof Error ? error.message : String(error),
        loadTime: Date.now() - startTime
      });
      throw error;
    }
  }

  private async navigateWithOptimizedWait(page: Page, url: string): Promise<void> {
    const navigationPromise = page.goto(url, {
      waitUntil: this.getWaitUntilCondition(),
      timeout: this.options.maxLoadTime
    });

    // Set up timeout handling
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Navigation timeout after ${this.options.maxLoadTime}ms`));
      }, this.options.maxLoadTime);
    });

    // Race between navigation and timeout
    await Promise.race([navigationPromise, timeoutPromise]);
  }

  private getWaitUntilCondition(): 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2' {
    // Choose optimal wait condition based on requirements
    if (this.options.waitForImages && this.options.waitForJS) {
      return 'networkidle2'; // Wait for network to be mostly idle
    } else if (this.options.waitForJS) {
      return 'domcontentloaded'; // Wait for DOM and JS
    } else {
      return 'domcontentloaded'; // Fastest option
    }
  }

  private async waitForCriticalResources(page: Page): Promise<void> {
    // Wait for specific critical resources based on analysis needs
    const promises: Promise<void>[] = [];

    if (this.options.waitForImages) {
      this.progressCallback?.(37, 'navigation', 'Loading images...');
      promises.push(this.waitForImages(page));
    }

    if (this.options.waitForJS) {
      this.progressCallback?.(38, 'navigation', 'Executing JavaScript...');
      promises.push(this.waitForJavaScript(page));
    }

    // Wait for all critical resources with timeout
    await Promise.race([
      Promise.all(promises),
      new Promise<void>(resolve => setTimeout(resolve, 5000)) // Max 5s additional wait
    ]);
  }

  private async waitForImages(page: Page): Promise<void> {
    try {
      await page.waitForFunction(
        () => {
          const images = Array.from(document.querySelectorAll('img'));
          return images.every(img => img.complete || img.naturalWidth > 0);
        },
        { timeout: 5000 }
      );
    } catch {
      logger.debug('Image loading timeout - proceeding with analysis');
    }
  }

  private async waitForJavaScript(page: Page): Promise<void> {
    try {
      // Wait for common JS frameworks to load
      await page.waitForFunction(
        () => {
          // Check if page seems to be done loading JavaScript
          return document.readyState === 'complete';
        },
        { timeout: 5000 }
      );
    } catch {
      logger.debug('JavaScript loading timeout - proceeding with analysis');
    }
  }
}
