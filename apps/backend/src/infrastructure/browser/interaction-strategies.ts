/**
 * User interaction strategies infrastructure - Element interaction implementations
 */

import { Page } from 'puppeteer';
import { NetworkMonitor } from './network-monitor.js';
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
}

export interface InteractionResult {
  success: boolean;
  strategy?: string;
  error?: string;
  networkActivity?: boolean;
}

export class InteractionStrategies {
  constructor(
    private page: Page,
    private networkMonitor: NetworkMonitor | null = null
  ) {}

  /**
   * Attempt to click an element using multiple strategies
   */
  async clickElement(element: ElementInfo, timeout = 5000): Promise<InteractionResult> {
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
    const startTime = Date.now();
    let networkActivityDetected = false;

    // Monitor network activity if available
    const networkListener = () => {
      networkActivityDetected = true;
    };

    if (this.networkMonitor) {
      this.networkMonitor.onActivity(networkListener);
    }

    try {
      const result = await strategy.execute(this.page, element, timeout);

      // Wait a moment to capture any network activity
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        ...result,
        networkActivity: networkActivityDetected
      };
    } finally {
      if (this.networkMonitor) {
        this.networkMonitor.removeActivityListener(networkListener);
      }
    }
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
    return allStrategies.sort((a, b) => a.priority - b.priority);
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
      const result = await page.evaluate(selector => {
        const el = document.querySelector(selector);
        if (!el) return false;

        (el as HTMLElement).click();
        return true;
      }, element.selector);

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
      const result = await page.evaluate(selector => {
        const el = document.querySelector(selector);
        if (!el) return false;

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

      await page.mouse.click(element.position.x, element.position.y);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Coordinate click failed'
      };
    }
  }
}
