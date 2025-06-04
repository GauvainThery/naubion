/**
 * User simulation orchestrator infrastructure - Coordinates user behavior simulation
 */

import { Page } from 'puppeteer';
import { AnalysisOptions } from '../../domain/models/analysis.js';
import { NetworkMonitor } from './network-monitor.js';
import { ElementFinder } from './element-finder.js';
import { InteractionStrategies } from './interaction-strategies.js';
import { BehaviorSimulator } from './behavior-simulator.js';
import logger from '../../shared/logger.js';

export interface SimulationConfig {
  maxInteractions: number;
  maxScrollSteps: number;
  enableHoverSimulation: boolean;
  enableFormInteraction: boolean;
  enableResponsiveTesting: boolean;
  elementTimeout: number;
  verboseLogging: boolean;
}

export interface SimulationResult {
  totalInteractions: number;
  successfulInteractions: number;
  pagesExplored: number;
  networkActivity: boolean;
}

export class UserSimulator {
  private networkMonitor: NetworkMonitor | null = null;
  private elementFinder: ElementFinder;
  private interactionStrategies: InteractionStrategies;
  private behaviorSimulator: BehaviorSimulator;
  private config: SimulationConfig;

  constructor(page: Page, options: AnalysisOptions) {
    this.config = {
      maxInteractions: options.maxInteractions,
      maxScrollSteps: options.maxScrollSteps,
      enableHoverSimulation: true,
      enableFormInteraction: false,
      enableResponsiveTesting: false,
      elementTimeout: 5000,
      verboseLogging: options.verboseLogging
    };

    // Initialize strategy classes
    this.elementFinder = new ElementFinder(page);
    this.interactionStrategies = new InteractionStrategies(page, null);
    this.behaviorSimulator = new BehaviorSimulator(page, null);
  }

  /**
   * Set the network monitor for all strategies
   */
  setNetworkMonitor(networkMonitor: NetworkMonitor): void {
    this.networkMonitor = networkMonitor;
    this.interactionStrategies = new InteractionStrategies(
      this.elementFinder['page'],
      networkMonitor
    );
    this.behaviorSimulator = new BehaviorSimulator(this.elementFinder['page'], networkMonitor);
  }

  /**
   * Main simulation orchestrator
   */
  async simulateUserBehavior(): Promise<SimulationResult> {
    try {
      logger.info('🖱️ Starting enhanced user behavior simulation...');

      let totalInteractions = 0;
      let successfulInteractions = 0;

      // Phase 1: Basic page exploration
      const pageInfo = await this.explorePageStructure();

      // Phase 2: Simulate scrolling and reading behavior
      await this.simulateReadingBehavior();

      // Phase 3: Discover and interact with elements
      const interactionResult = await this.discoverAndInteractWithElements();
      totalInteractions += interactionResult.total;
      successfulInteractions += interactionResult.successful;

      // Phase 4: Advanced interactions (optional)
      if (this.config.enableHoverSimulation) {
        await this.performHoverInteractions();
      }

      if (this.config.enableFormInteraction) {
        await this.performFormInteractions();
      }

      if (this.config.enableResponsiveTesting) {
        await this.performResponsiveTests();
      }

      // Phase 5: Final network settlement
      await this.finalNetworkSettlement();

      logger.info(
        `✅ User behavior simulation completed - ${successfulInteractions}/${totalInteractions} interactions successful`
      );

      return {
        totalInteractions,
        successfulInteractions,
        pagesExplored: 1,
        networkActivity: this.networkMonitor?.hasActivity() || false
      };
    } catch (error) {
      logger.error('❌ User behavior simulation failed:', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Simplified interaction method for specific element types
   */
  async interactWithElements(
    elementType = 'buttons',
    options: any = {}
  ): Promise<SimulationResult> {
    const { maxElements = 3 } = options;

    logger.info(`🎯 Simplified interaction with ${elementType}...`);

    try {
      const elements = await this.elementFinder.findElementsByType(elementType, { maxElements });

      let successful = 0;
      for (const element of elements) {
        const result = await this.attemptElementInteraction(element);
        if (result) successful++;
      }

      return {
        totalInteractions: elements.length,
        successfulInteractions: successful,
        pagesExplored: 1,
        networkActivity: this.networkMonitor?.hasActivity() || false
      };
    } catch (error) {
      logger.error(`❌ Simplified interaction failed:`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Custom interaction with specific element
   */
  async customInteraction(
    elementSelector: string,
    timeout?: number
  ): Promise<{ success: boolean; error?: string }> {
    const actualTimeout = timeout || this.config.elementTimeout;

    try {
      const element = await this.elementFinder['page'].evaluate(selector => {
        const el = document.querySelector(selector);
        if (!el) return null;

        // Use the helper functions injected by ElementFinder
        return (window as any)._createElement(el, 'custom', 'custom');
      }, elementSelector);

      if (!element) {
        return { success: false, error: 'Element not found' };
      }

      const result = await this.interactionStrategies.clickElement(element, actualTimeout);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Private orchestration methods

  private async explorePageStructure(): Promise<any> {
    logger.debug('🔍 Exploring page structure...');

    const pageInfo = await this.elementFinder['page'].evaluate(() => ({
      title: document.title,
      url: window.location.href,
      hasFrames: window.frames.length > 0,
      hasServiceWorker: 'serviceWorker' in navigator,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      pageSize: {
        width: document.body.scrollWidth,
        height: document.body.scrollHeight
      }
    }));

    if (this.config.verboseLogging) {
      logger.debug(`   Page: ${pageInfo.title}`);
      logger.debug(`   Dimensions: ${pageInfo.pageSize.width}x${pageInfo.pageSize.height}`);
      logger.debug(`   Viewport: ${pageInfo.viewport.width}x${pageInfo.viewport.height}`);
    }

    return pageInfo;
  }

  private async simulateReadingBehavior(): Promise<void> {
    logger.debug('📖 Simulating reading behavior...');

    await this.behaviorSimulator.simulateScrolling({
      maxSteps: this.config.maxScrollSteps,
      pauseBetweenScrolls: [800, 1400],
      scrollToTop: true,
      triggerLazyLoad: true
    });

    // Wait for any lazy-loaded content
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  private async discoverAndInteractWithElements(): Promise<{ total: number; successful: number }> {
    logger.debug('🔘 Discovering and interacting with elements...');

    // Use smart element detection for better results
    const smartElements = await this.elementFinder.findSmartElements();
    const interactiveElements = await this.elementFinder.findInteractiveElements();

    // Combine and prioritize elements
    const allElements = [...smartElements, ...interactiveElements.buttons];
    const uniqueElements = this.deduplicateElements(allElements);

    logger.debug(`   Found ${uniqueElements.length} unique interactive elements`);

    let successful = 0;
    const maxElements = Math.min(uniqueElements.length, this.config.maxInteractions);

    for (let i = 0; i < maxElements; i++) {
      const element = uniqueElements[i];
      const success = await this.attemptElementInteraction(element);
      if (success) successful++;
    }

    logger.debug(`   Successfully interacted with ${successful}/${maxElements} elements`);
    return { total: maxElements, successful };
  }

  private async performHoverInteractions(): Promise<void> {
    logger.debug('🎯 Performing hover interactions...');

    try {
      const hoverElements = await this.elementFinder.findElementsByType('hover', {
        maxElements: 3
      });
      await this.behaviorSimulator.simulateHoverEffects(hoverElements, {
        hoverDuration: [500, 1500],
        waitForContent: 1000
      });
    } catch (error) {
      logger.debug('❌ Hover interactions failed:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async performFormInteractions(): Promise<void> {
    logger.debug('📝 Performing form interactions...');

    try {
      const formElements = await this.elementFinder.findElementsByType('forms', { maxElements: 2 });
      await this.behaviorSimulator.simulateTyping(formElements);
      await this.behaviorSimulator.simulateFocusEvents(formElements);
    } catch (error) {
      logger.debug('❌ Form interactions failed:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async performResponsiveTests(): Promise<void> {
    logger.debug('📱 Performing responsive tests...');

    await this.behaviorSimulator.simulateViewportChanges({
      viewports: [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ],
      pauseBetweenChanges: 1000
    });
  }

  private async attemptElementInteraction(element: any): Promise<boolean> {
    try {
      if (this.config.verboseLogging) {
        logger.debug(
          `   Attempting interaction with: ${element.text?.substring(0, 30) || element.selector}`
        );
      }

      const result = await this.interactionStrategies.clickElement(
        element,
        this.config.elementTimeout
      );

      if (result.success) {
        // Wait for any network activity triggered by the interaction
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      } else {
        if (this.config.verboseLogging) {
          logger.debug(`   ❌ Interaction failed: ${result.error}`);
        }
        return false;
      }
    } catch (error) {
      if (this.config.verboseLogging) {
        logger.debug(`   ❌ Interaction error: ${error}`);
      }
      return false;
    }
  }

  private async finalNetworkSettlement(): Promise<void> {
    if (!this.networkMonitor) return;

    logger.debug('🌐 Final network activity check...');

    await this.networkMonitor.waitForNetworkIdle(
      5000, // 5 seconds of complete quiet
      30000, // Max wait 30 seconds
      this.config.verboseLogging
    );

    const finalResourceCount = this.networkMonitor.getResources().length;
    const finalTransferSize = this.networkMonitor.getTotalTransferSize();

    logger.debug(
      `✅ Final network state: ${finalResourceCount} resources, ${Math.round(finalTransferSize / 1024)}KB total`
    );
  }

  private deduplicateElements(elements: any[]): any[] {
    const seen = new Set();
    return elements.filter(element => {
      const key = `${element.selector}_${element.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

/**
 * Factory function to create user simulator with configuration
 */
export function createUserSimulator(page: Page, analysisOptions: AnalysisOptions): UserSimulator {
  return new UserSimulator(page, analysisOptions);
}
