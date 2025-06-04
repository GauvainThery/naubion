/**
 * Browser behavior simulation infrastructure - User behavior patterns
 */

import { Page } from 'puppeteer';
import { NetworkMonitor } from './network-monitor.js';
import logger from '../../shared/logger.js';

export interface ScrollOptions {
  maxSteps?: number;
  pauseBetweenScrolls?: [number, number];
  scrollToTop?: boolean;
  triggerLazyLoad?: boolean;
}

export interface HoverOptions {
  hoverDuration?: [number, number];
  waitForContent?: number;
  maxElements?: number;
}

export interface ViewportOptions {
  viewports?: Array<{ width: number; height: number }>;
  pauseBetweenChanges?: number;
}

export class BehaviorSimulator {
  constructor(
    private page: Page,
    private networkMonitor: NetworkMonitor | null = null
  ) {}

  /**
   * Simulate natural scrolling behavior
   */
  async simulateScrolling(options: ScrollOptions = {}): Promise<void> {
    const {
      maxSteps = 5,
      pauseBetweenScrolls = [800, 1400],
      scrollToTop = true,
      triggerLazyLoad = true
    } = options;

    logger.debug('📜 Starting scrolling simulation...');

    try {
      // Get page dimensions
      const { scrollHeight, viewportHeight } = await this.page.evaluate(() => ({
        scrollHeight: document.body.scrollHeight,
        viewportHeight: window.innerHeight
      }));

      const scrollStep = Math.min(
        Math.floor((scrollHeight - viewportHeight) / maxSteps),
        viewportHeight * 0.8
      );

      let currentPosition = 0;

      for (let i = 0; i < maxSteps; i++) {
        // Calculate next scroll position
        const nextPosition = Math.min(currentPosition + scrollStep, scrollHeight - viewportHeight);

        // Perform smooth scroll
        await this.page.evaluate(position => {
          window.scrollTo({
            top: position,
            behavior: 'smooth'
          });
        }, nextPosition);

        // Wait for scroll to complete and content to load
        await this.randomDelay(pauseBetweenScrolls);

        if (triggerLazyLoad) {
          await this.waitForLazyContent();
        }

        currentPosition = nextPosition;

        // Stop if we've reached the bottom
        if (nextPosition >= scrollHeight - viewportHeight) {
          break;
        }
      }

      // Scroll back to top if requested
      if (scrollToTop) {
        await this.page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        await this.randomDelay([500, 1000]);
      }

      logger.debug(`✅ Scrolling simulation completed (${maxSteps} steps)`);
    } catch (error) {
      logger.error('❌ Scrolling simulation failed:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Simulate hover effects on elements
   */
  async simulateHoverEffects(elements: any[], options: HoverOptions = {}): Promise<void> {
    const { hoverDuration = [500, 1500], waitForContent = 1000, maxElements = 3 } = options;

    logger.debug(
      `🎯 Simulating hover effects on ${Math.min(elements.length, maxElements)} elements...`
    );

    const elementsToHover = elements.slice(0, maxElements);

    for (const element of elementsToHover) {
      try {
        // Move to element position
        if (element.position && element.position.x > 0 && element.position.y > 0) {
          await this.page.mouse.move(element.position.x, element.position.y);

          // Hold hover
          await this.randomDelay(hoverDuration);

          // Wait for any hover content to load
          await this.waitForHoverContent(waitForContent);
        }
      } catch (error) {
        logger.debug(`❌ Hover simulation failed for element: ${element.text}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.debug('✅ Hover simulation completed');
  }

  /**
   * Simulate focus events on interactive elements
   */
  async simulateFocusEvents(elements: any[], options: any = {}): Promise<void> {
    const { maxElements = 5, focusDuration = [300, 800] } = options;

    logger.debug(
      `🎯 Simulating focus events on ${Math.min(elements.length, maxElements)} elements...`
    );

    const focusableElements = elements
      .filter(el => el.isInteractive && !el.isDisabled)
      .slice(0, maxElements);

    for (const element of focusableElements) {
      try {
        await this.page.focus(element.selector);
        await this.randomDelay(focusDuration);

        // Simulate tab navigation occasionally
        if (Math.random() < 0.3) {
          await this.page.keyboard.press('Tab');
          await this.randomDelay([200, 500]);
        }
      } catch (error) {
        logger.debug(`❌ Focus simulation failed for element: ${element.text}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.debug('✅ Focus simulation completed');
  }

  /**
   * Simulate typing in form fields
   */
  async simulateTyping(formElements: any[], options: any = {}): Promise<void> {
    const { maxFields = 3, sampleTexts = ['test', 'sample', 'example'] } = options;

    logger.debug(
      `⌨️ Simulating typing in ${Math.min(formElements.length, maxFields)} form fields...`
    );

    const fieldsToType = formElements.slice(0, maxFields);

    for (const field of fieldsToType) {
      try {
        await this.page.focus(field.selector);

        // Clear existing content
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('a');
        await this.page.keyboard.up('Control');

        // Type sample text
        const sampleText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        await this.page.type(field.selector, sampleText, { delay: 100 });

        await this.randomDelay([500, 1000]);
      } catch (error) {
        logger.debug(`❌ Typing simulation failed for field: ${field.text}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.debug('✅ Typing simulation completed');
  }

  /**
   * Simulate viewport resize to test responsive behavior
   */
  async simulateViewportChanges(options: ViewportOptions = {}): Promise<void> {
    const {
      viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ],
      pauseBetweenChanges = 1000
    } = options;

    logger.debug('📱 Simulating viewport changes...');

    for (const viewport of viewports) {
      try {
        await this.page.setViewport({
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1
        });

        // Wait for responsive changes to settle
        await this.randomDelay([pauseBetweenChanges, pauseBetweenChanges * 1.5]);

        // Wait for any responsive content
        await this.waitForResponsiveContent();
      } catch (error) {
        logger.debug(`❌ Viewport change failed for ${viewport.width}x${viewport.height}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.debug('✅ Viewport simulation completed');
  }

  /**
   * Simulate device capabilities like touch, orientation
   */
  async simulateDeviceCapabilities(options: any = {}): Promise<void> {
    const { enableTouch = true, enableOrientation = false } = options;

    logger.debug('📱 Simulating device capabilities...');

    try {
      if (enableTouch) {
        // Enable touch events
        await this.page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'maxTouchPoints', {
            value: 1,
            configurable: true
          });
        });
      }

      if (enableOrientation) {
        // Simulate orientation change
        await this.page.evaluate(() => {
          window.dispatchEvent(new Event('orientationchange'));
        });
        await this.randomDelay([500, 1000]);
      }

      logger.debug('✅ Device capability simulation completed');
    } catch (error) {
      logger.debug('❌ Device capability simulation failed:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Private helper methods

  private async waitForLazyContent(timeout = 2000): Promise<void> {
    try {
      // Wait for images to start loading
      await this.page.waitForFunction(
        () => {
          const images = Array.from(
            document.querySelectorAll('img[data-src], img[loading="lazy"]')
          );
          return images.every(
            img => (img as HTMLImageElement).complete || (img as HTMLImageElement).naturalWidth > 0
          );
        },
        { timeout }
      );
    } catch {
      // Timeout is acceptable for lazy loading
    }
  }

  private async waitForHoverContent(timeout = 1000): Promise<void> {
    try {
      // Wait for any dynamic content that might appear on hover
      await this.page.waitForFunction(
        () => {
          const dropdowns = document.querySelectorAll(
            '.dropdown-menu, .hover-content, [aria-expanded="true"]'
          );
          return (
            dropdowns.length === 0 ||
            Array.from(dropdowns).some(el => (el as HTMLElement).offsetParent !== null)
          );
        },
        { timeout }
      );
    } catch {
      // Timeout is acceptable
    }
  }

  private async waitForResponsiveContent(timeout = 2000): Promise<void> {
    try {
      // Wait for responsive layout changes
      await this.page.waitForFunction(
        () => {
          // Check if layout has stabilized by monitoring element positions
          const elements = document.querySelectorAll('header, nav, main, .container');
          return Array.from(elements).every(
            el => (el as HTMLElement).offsetWidth > 0 && (el as HTMLElement).offsetHeight > 0
          );
        },
        { timeout }
      );
    } catch {
      // Timeout is acceptable
    }
  }

  private async scrollToElement(element: any): Promise<void> {
    try {
      await this.page.evaluate(selector => {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, element.selector);

      await this.randomDelay([300, 600]);
    } catch (error) {
      logger.debug('❌ Scroll to element failed:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async randomDelay(range: [number, number]): Promise<void> {
    const [min, max] = range;
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
