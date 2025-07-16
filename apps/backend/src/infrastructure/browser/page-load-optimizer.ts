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
    const maxRetries = 3;
    const baseTimeout = Math.min(this.options.maxLoadTime, 30000); // Cap at 30s per attempt

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Navigation attempt ${attempt}/${maxRetries} for ${url}`);

        // Progressive timeout reduction for retries
        const attemptTimeout = attempt === 1 ? baseTimeout : Math.max(baseTimeout * 0.7, 15000);

        // Use a more reliable navigation strategy
        const navigationPromise = this.navigateWithFallback(page, url, attemptTimeout);

        // Set up timeout with progress monitoring
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => {
            reject(
              new Error(
                `Navigation timeout after ${attemptTimeout}ms (attempt ${attempt}/${maxRetries})`
              )
            );
          }, attemptTimeout);

          // Monitor navigation progress
          const progressInterval = global.setInterval(() => {
            page
              .evaluate(() => document.readyState)
              .then(readyState => {
                if (readyState !== 'loading') {
                  logger.debug(`Navigation progress: ${readyState}`);
                }
              })
              .catch(() => {
                // Page might be navigating, ignore errors
              });
          }, 5000);

          // Cleanup on completion
          navigationPromise.finally(() => {
            clearTimeout(timeoutId);
            global.clearInterval(progressInterval);
          });
        });

        // Race between navigation and timeout
        await Promise.race([navigationPromise, timeoutPromise]);

        // If we get here, navigation succeeded
        logger.debug(`Navigation successful on attempt ${attempt}`);
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`Navigation attempt ${attempt} failed: ${errorMessage}`);

        if (attempt === maxRetries) {
          throw new Error(
            `Navigation failed after ${maxRetries} attempts. Last error: ${errorMessage}`
          );
        }

        // Wait before retry with exponential backoff
        const retryDelay = Math.min(2000 * attempt, 5000);
        logger.debug(`Retrying navigation in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  private async navigateWithFallback(page: Page, url: string, timeout: number): Promise<void> {
    // Try different wait strategies in order of preference
    const waitStrategies: Array<'domcontentloaded' | 'load' | 'networkidle2'> = [
      'domcontentloaded', // Fast and reliable
      'load', // More complete but slower
      'networkidle2' // Most complete but can hang
    ];

    for (const waitUntil of waitStrategies) {
      try {
        await page.goto(url, {
          waitUntil,
          timeout: waitUntil === 'networkidle2' ? Math.min(timeout, 20000) : timeout
        });

        // Additional validation that page actually loaded
        const pageTitle = await page.title();
        const pageUrl = page.url();

        if (!pageTitle && !pageUrl.includes(new URL(url).hostname)) {
          throw new Error('Page appears to have failed to load properly');
        }

        logger.debug(`Navigation successful with ${waitUntil} strategy`);
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.debug(`Navigation with ${waitUntil} failed: ${errorMessage}`);

        // If this isn't the last strategy, try the next one
        if (waitUntil !== waitStrategies[waitStrategies.length - 1]) {
          continue;
        }

        // All strategies failed, throw the error
        throw error;
      }
    }
  }

  private getWaitUntilCondition(): 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2' {
    // Be more conservative with wait conditions to avoid hangs
    // The new fallback navigation will try multiple strategies anyway
    if (this.options.waitForImages && this.options.waitForJS) {
      return 'load'; // Changed from 'networkidle2' to 'load' for better reliability
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
