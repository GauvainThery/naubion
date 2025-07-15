/**
 * User interaction strategies infrastructure - Element interaction implementations
 */

import { Page } from 'puppeteer';
import logger from '../../shared/logger.js';

export interface ElementInfo {
  id: string;
  type: string;
  text: string;
  selector: string;
  tagName: string;
  className: string;
  elementId: string;
  isVisible: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dataAttributes: string;
  isDisabled: boolean;
  hasClickHandler: boolean;
  ariaLabel: string;
  role: string;
  isInteractive: boolean;
  confidence?: number;
}

export interface InteractionResult {
  success: boolean;
  strategy?: string;
  error?: string;
}

export class InteractionStrategies {
  constructor(private page: Page) {}

  /**
   * Attempt to click an element using multiple strategies
   */
  async clickElement(element: ElementInfo, timeout = 10000): Promise<InteractionResult> {
    const strategies = this.selectOptimalStrategies(element);

    for (const strategy of strategies) {
      try {
        logger.debug(
          `Trying ${strategy.name} strategy for element: ${element.text.substring(0, 30)}`
        );

        const result = await this.executeStrategy(strategy, element, timeout);

        if (result.success) {
          logger.debug(`✅ ${strategy.name} strategy succeeded`);
          return {
            ...result,
            strategy: strategy.name
          };
        }

        logger.debug(`❌ ${strategy.name} strategy failed: ${result.error}`);
      } catch (error) {
        logger.debug(`❌ ${strategy.name} strategy threw error: ${error}`);
      }
    }

    return {
      success: false,
      error: 'All interaction strategies failed'
    };
  }

  /**
   * Execute a specific interaction strategy
   */
  private async executeStrategy(
    strategy: InteractionStrategy,
    element: ElementInfo,
    timeout: number
  ): Promise<InteractionResult> {
    try {
      const result = await strategy.execute(this.page, element, timeout);
      await this.waitForNetworkIdle();

      return {
        ...result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Strategy execution failed'
      };
    }
  }

  private async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForNetworkIdle({
      timeout: 3000
    });
  }

  /**
   * Select optimal strategies based on element characteristics
   */
  private selectOptimalStrategies(element: ElementInfo): InteractionStrategy[] {
    const allStrategies = [
      new ClickStrategy(),
      new EvaluateStrategy(),
      new DispatchEventStrategy(),
      new CoordinateStrategy()
    ];

    // Adjust priorities based on element characteristics
    if (element.isDisabled) {
      // Disabled elements might only work with dispatch events
      allStrategies[2].priority = 0.1;
    }

    if (element.hasClickHandler) {
      // Elements with click handlers work better with evaluate strategy
      allStrategies[1].priority = 0.5;
    }

    if (!element.isVisible) {
      // Hidden elements work better with coordinate or evaluate strategies
      allStrategies[1].priority = 0.3;
      allStrategies[3].priority = 0.4;
    }

    // Sort by priority (lower = higher priority)
    return allStrategies.sort((a, b) => b.priority - a.priority);
  }
}

// Strategy interface
interface InteractionStrategy {
  name: string;
  priority: number;
  execute(page: Page, element: ElementInfo, timeout: number): Promise<InteractionResult>;
}

// Standard click strategy
class ClickStrategy implements InteractionStrategy {
  name = 'click';
  priority = 0.2;

  async execute(page: Page, element: ElementInfo, timeout: number): Promise<InteractionResult> {
    try {
      await page.waitForSelector(element.selector, { timeout, visible: true });
      await page.click(element.selector);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Click failed'
      };
    }
  }
}

// JavaScript evaluation strategy
class EvaluateStrategy implements InteractionStrategy {
  name = 'evaluate';
  priority = 0.3;

  async execute(page: Page, element: ElementInfo, timeout: number): Promise<InteractionResult> {
    try {
      const evaluatePromise = page.evaluate(selector => {
        const el = document.querySelector(selector);
        if (!el) {
          return false;
        }

        (el as HTMLElement).click();
        return true;
      }, element.selector);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error(`Evaluate strategy timed out after ${timeout}ms`)),
          timeout
        );
      });

      const result = await Promise.race([evaluatePromise, timeoutPromise]);

      if (!result) {
        return { success: false, error: 'Element not found during evaluation' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Evaluate strategy failed'
      };
    }
  }
}

// Event dispatch strategy
class DispatchEventStrategy implements InteractionStrategy {
  name = 'dispatch_event';
  priority = 0.4;

  async execute(page: Page, element: ElementInfo, timeout: number): Promise<InteractionResult> {
    try {
      const dispatchPromise = page.evaluate(selector => {
        const el = document.querySelector(selector);
        if (!el) {
          return false;
        }

        // Dispatch multiple events to simulate real interaction
        const events = ['mousedown', 'mouseup', 'click'];

        events.forEach(eventType => {
          const event = new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            view: window
          });
          el.dispatchEvent(event);
        });

        return true;
      }, element.selector);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Event dispatch timed out after ${timeout}ms`)), timeout);
      });

      const result = await Promise.race([dispatchPromise, timeoutPromise]);

      if (!result) {
        return { success: false, error: 'Element not found during event dispatch' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Event dispatch failed'
      };
    }
  }
}

// Coordinate-based click strategy
class CoordinateStrategy implements InteractionStrategy {
  name = 'coordinate';
  priority = 0.6;

  async execute(page: Page, element: ElementInfo, timeout: number): Promise<InteractionResult> {
    try {
      if (!element.isVisible || element.position.x <= 0 || element.position.y <= 0) {
        return { success: false, error: 'Element not visible or has invalid coordinates' };
      }

      // Set a timeout for the coordinate click operation
      const clickPromise = page.mouse.click(element.position.x, element.position.y);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error(`Coordinate click timed out after ${timeout}ms`)),
          timeout
        );
      });

      await Promise.race([clickPromise, timeoutPromise]);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Coordinate click failed'
      };
    }
  }
}
