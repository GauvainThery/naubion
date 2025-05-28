/**
 * Enhanced User Simulator with modular, configurable strategies
 * Orchestrates user behavior simulation using specialized strategy classes
 */

import { BehaviorSimulator } from './strategies/behavior-simulator.js';
import { ElementFinder, injectElementFinderHelpers } from './strategies/element-finder.js';
import { InteractionStrategies } from './strategies/interaction-strategies.js';

export class UserSimulator {
  constructor(page, config = {}) {
    this.page = page;
    this.networkMonitor = null;

    // Configuration with sensible defaults
    this.config = {
      maxInteractions: 5,
      maxScrollSteps: 5,
      enableHoverSimulation: true,
      enableFormInteraction: false,
      enableResponsiveTesting: false,
      elementTimeout: 5000, // Timeout per element interaction
      verboseLogging: true,
      ...config
    };

    // Initialize strategy classes
    this.interactionStrategies = new InteractionStrategies(page, null);
    this.elementFinder = new ElementFinder(page);
    this.behaviorSimulator = new BehaviorSimulator(page, null);
  }

  /**
   * Set the network monitor for all strategies
   */
  setNetworkMonitor(networkMonitor) {
    this.networkMonitor = networkMonitor;
    this.interactionStrategies.networkMonitor = networkMonitor;
    this.behaviorSimulator.networkMonitor = networkMonitor;
  }

  /**
   * Main simulation orchestrator
   */
  async simulateUserBehavior() {
    try {
      console.log('🖱️ Starting enhanced user behavior simulation...');

      // Inject helper functions into page context
      await this._injectHelpers();

      // Phase 1: Basic page exploration
      await this._explorePageStructure();

      // Phase 2: Simulate scrolling and reading behavior
      await this._simulateReadingBehavior();

      // Phase 3: Discover and interact with elements
      await this._discoverAndInteractWithElements();

      // Phase 4: Advanced interactions (optional)
      if (this.config.enableHoverSimulation) {
        await this._performHoverInteractions();
      }

      if (this.config.enableFormInteraction) {
        await this._performFormInteractions();
      }

      if (this.config.enableResponsiveTesting) {
        await this._performResponsiveTests();
      }

      // Phase 5: Final network settlement
      await this._finalNetworkSettlement();

      console.log('✅ User behavior simulation completed successfully');
    } catch (error) {
      console.log('⚠️ User simulation encountered issues (this is normal):', error.message);
    }
  }

  /**
   * Simplified interaction method for specific element types
   */
  async interactWithElements(elementType = 'buttons', options = {}) {
    const elements = await this.elementFinder.findElementsByType(elementType, options);

    if (elements.length === 0) {
      console.log(`No ${elementType} found for interaction`);
      return { interacted: 0, successful: 0 };
    }

    console.log(`🎯 Found ${elements.length} ${elementType} for interaction`);

    let successful = 0;
    const maxElements = Math.min(elements.length, this.config.maxInteractions);

    for (let i = 0; i < maxElements; i++) {
      const element = elements[i];
      const success = await this._attemptElementInteraction(element);
      if (success) successful++;
    }

    return { interacted: maxElements, successful };
  }

  /**
   * Custom interaction with specific element
   */
  async customInteraction(elementSelector, timeout = null) {
    const actualTimeout = timeout || this.config.elementTimeout;

    const element = await this.page.evaluate(selector => {
      const el = document.querySelector(selector);
      if (!el) return null;

      return window._createElement(el, 'custom', 'custom');
    }, elementSelector);

    if (!element) {
      return { success: false, error: 'Element not found' };
    }

    const result = await this.interactionStrategies.clickElement(element, actualTimeout);
    return result;
  }

  // Private orchestration methods

  async _injectHelpers() {
    await injectElementFinderHelpers(this.page);
  }

  async _explorePageStructure() {
    console.log('🔍 Exploring page structure...');

    const pageInfo = await this.page.evaluate(() => ({
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
      console.log(`   Page: ${pageInfo.title}`);
      console.log(`   Dimensions: ${pageInfo.pageSize.width}x${pageInfo.pageSize.height}`);
      console.log(`   Viewport: ${pageInfo.viewport.width}x${pageInfo.viewport.height}`);
    }

    return pageInfo;
  }

  async _simulateReadingBehavior() {
    console.log('📖 Simulating reading behavior...');

    await this.behaviorSimulator.simulateScrolling({
      maxSteps: this.config.maxScrollSteps,
      pauseBetweenScrolls: [800, 1400],
      scrollToTop: true,
      triggerLazyLoad: true
    });

    // Wait for any lazy-loaded content
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  async _discoverAndInteractWithElements() {
    console.log('🔘 Discovering and interacting with elements...');

    // Use smart element detection for better results
    const smartElements = await this.elementFinder.findSmartElements();
    const interactiveElements = await this.elementFinder.findInteractiveElements();

    // Combine and prioritize elements
    const allElements = [...smartElements, ...interactiveElements.buttons];
    const uniqueElements = this._deduplicateElements(allElements);

    console.log(`   Found ${uniqueElements.length} unique interactive elements`);

    let successful = 0;
    const maxElements = Math.min(uniqueElements.length, this.config.maxInteractions);

    for (let i = 0; i < maxElements; i++) {
      const element = uniqueElements[i];
      const success = await this._attemptElementInteraction(element);
      if (success) successful++;
    }

    console.log(`   Successfully interacted with ${successful}/${maxElements} elements`);
    return { total: maxElements, successful };
  }

  async _performHoverInteractions() {
    console.log('🖱️ Performing hover interactions...');

    const elements = await this.elementFinder.findInteractiveElements();
    await this.behaviorSimulator.simulateHoverEffects(elements.hoverElements, {
      maxElements: 3,
      hoverDuration: 600
    });
  }

  async _performFormInteractions() {
    console.log('📝 Performing form interactions...');

    const formElements = await this.elementFinder.findElementsByType('forms', {
      maxElements: 3,
      mustBeVisible: true
    });

    if (formElements.length > 0) {
      await this.behaviorSimulator.simulateTyping(formElements, {
        sampleText: 'test@example.com',
        typingSpeed: 100
      });
    }
  }

  async _performResponsiveTests() {
    console.log('📱 Performing responsive tests...');

    await this.behaviorSimulator.simulateViewportChanges({
      viewports: [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ],
      pauseBetweenChanges: 1000
    });
  }

  async _attemptElementInteraction(element) {
    console.log(`   🎯 Attempting interaction with: "${element.text}" (${element.type})`);

    try {
      // Use the simplified clickElement method with timeout
      const result = await this.interactionStrategies.clickElement(
        element,
        this.config.elementTimeout
      );

      if (result.success) {
        console.log(`     ✅ Success using ${result.method} strategy in ${result.duration}ms`);
        return true;
      } else {
        if (this.config.verboseLogging) {
          console.log(`     ❌ Failed to interact: ${result.error} (${result.duration}ms)`);
        }
        return false;
      }
    } catch (error) {
      if (this.config.verboseLogging) {
        console.log(`     ⚠️ Interaction error: ${error.message}`);
      }
      return false;
    }
  }

  async _finalNetworkSettlement() {
    if (!this.networkMonitor) return;

    console.log('🌐 Final network activity check...');

    await this.networkMonitor.waitForNetworkIdle(
      5000, // 5 seconds of complete quiet
      30000, // Max wait 30 seconds
      this.config.verboseLogging
    );

    const finalResourceCount = this.networkMonitor.getResources().length;
    const finalTransferSize = this.networkMonitor.getTotalTransferSize();

    console.log(
      `✅ Final network state: ${finalResourceCount} resources, ${Math.round(finalTransferSize / 1024)}KB total`
    );
  }

  _deduplicateElements(elements) {
    const seen = new Set();
    return elements.filter(element => {
      const key = `${element.selector}_${element.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// Export factory function for different simulation profiles
export function createUserSimulator(page, profile = 'default') {
  const profiles = {
    default: {
      maxInteractions: 5,
      maxScrollSteps: 5,
      enableHoverSimulation: true,
      enableFormInteraction: false,
      enableResponsiveTesting: false,
      elementTimeout: 5000
    },
    thorough: {
      maxInteractions: 10,
      maxScrollSteps: 8,
      enableHoverSimulation: true,
      enableFormInteraction: true,
      enableResponsiveTesting: true,
      verboseLogging: true,
      elementTimeout: 8000
    },
    minimal: {
      maxInteractions: 3,
      maxScrollSteps: 3,
      enableHoverSimulation: false,
      enableFormInteraction: false,
      enableResponsiveTesting: false,
      verboseLogging: false,
      elementTimeout: 3000
    },
    mobile: {
      maxInteractions: 4,
      maxScrollSteps: 6,
      enableHoverSimulation: false, // No hover on mobile
      enableFormInteraction: true,
      enableResponsiveTesting: false,
      elementTimeout: 4000 // Shorter timeout for mobile
    }
  };

  const config = profiles[profile] || profiles.default;
  return new UserSimulator(page, config);
}
