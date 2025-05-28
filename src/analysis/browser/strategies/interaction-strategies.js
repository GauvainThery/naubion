/**
 * Simplified interaction strategies for button clicks and element interactions
 * Focuses on reliability and maintainability over comprehensive coverage
 */

export class InteractionStrategies {
  constructor(page, networkMonitor = null) {
    this.page = page;
    this.networkMonitor = networkMonitor;
  }

  /**
   * Universal interaction method with timeout - tries multiple approaches
   * @param {Object} element - Element to interact with
   * @param {number} timeout - Timeout in milliseconds (default: 5000)
   * @returns {Promise<Object>} Interaction result
   */
  async clickElement(element, timeout = 5000) {
    const startTime = Date.now();

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Interaction timeout after ${timeout}ms`)), timeout);
    });

    // Main interaction logic with retry
    const interactionPromise = this._attemptClickWithRetry(element);

    try {
      const result = await Promise.race([interactionPromise, timeoutPromise]);
      const duration = Date.now() - startTime;

      if (result.success) {
        console.log(`   ✅ Clicked "${element.text}" in ${duration}ms using ${result.method}`);

        // Smart network waiting based on interaction type
        const networkWaitTime = this._calculateNetworkWaitTime(element, timeout - duration);
        if (networkWaitTime > 0) {
          await this._waitForNetworkResponse(networkWaitTime);
        }

        return { ...result, duration };
      } else {
        console.log(`   ❌ Failed to click "${element.text}" after ${duration}ms: ${result.error}`);
        return { ...result, duration };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ Failed to click "${element.text}" after ${duration}ms: ${error.message}`);
      return { success: false, error: error.message, duration };
    }
  }

  /**
   * Attempt click with intelligent retry logic
   */
  async _attemptClickWithRetry(element) {
    let lastError = null;
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Wait a bit between retries (except first attempt)
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 200 * attempt));
      }

      try {
        const result = await this._attemptClick(element);
        if (result.success) {
          return result;
        }
        lastError = result;

        // If element is not in viewport, try scrolling before next attempt
        if (attempt < maxRetries && result.error?.includes('not visible')) {
          await this._ensureElementInViewport(element);
        }
      } catch (error) {
        lastError = { success: false, error: error.message };
      }
    }

    return lastError || { success: false, error: 'Unknown error during retry attempts' };
  }

  /**
   * Ensure element is in viewport before interaction
   */
  async _ensureElementInViewport(element) {
    try {
      await this.page.evaluate(selector => {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
        }
      }, element.selector);
      // Give time for scroll to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      // Ignore scroll errors
    }
  }

  /**
   * Calculate optimal network wait time based on element type
   */
  _calculateNetworkWaitTime(element, remainingTime) {
    if (remainingTime <= 0) return 0;

    // Different elements typically trigger different amounts of network activity
    const baseWaitTime = {
      submit: 3000, // Form submissions often trigger significant network activity
      button: 2000, // Buttons might trigger API calls or navigation
      link: 1500, // Links typically navigate or load content
      menu: 1000, // Menu interactions might load content
      modal: 800, // Modal interactions are usually quick
      default: 1500 // Default wait time
    };

    const elementType = element.type || 'default';
    const suggestedWait = baseWaitTime[elementType] || baseWaitTime.default;

    // Don't wait longer than remaining time, and cap at reasonable limits
    return Math.min(suggestedWait, remainingTime, 4000);
  }

  /**
   * Attempt click using optimized strategy selection
   */
  async _attemptClick(element) {
    // Pre-flight validation
    const validation = await this._validateElement(element);
    if (!validation.isValid) {
      return { success: false, error: validation.reason };
    }

    // Smart strategy selection based on element properties
    const strategies = this._selectOptimalStrategies(element);
    const errors = [];

    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = await strategies[i].fn();
        if (result.success) {
          return result;
        } else {
          errors.push(`${strategies[i].name}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`${strategies[i].name}: ${error.message}`);
        // Continue to next strategy
        if (i === strategies.length - 1) {
          // Last strategy failed, return detailed error
          return {
            success: false,
            error: `All strategies failed: ${errors.join('; ')}`,
            attempts: errors.length
          };
        }
      }
    }

    return {
      success: false,
      error: `All strategies failed: ${errors.join('; ')}`,
      attempts: errors.length
    };
  }

  /**
   * Pre-flight element validation to avoid unnecessary strategy attempts
   */
  async _validateElement(element) {
    if (!element || !element.selector) {
      return { isValid: false, reason: 'Invalid element or missing selector' };
    }

    // Check if element exists and is interactable in a single page evaluation
    const validation = await this.page.evaluate(selector => {
      const el = document.querySelector(selector);
      if (!el) return { isValid: false, reason: 'Element not found in DOM' };

      // Comprehensive visibility and interactability check
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      const isVisible = rect.width > 0 && rect.height > 0;
      const isDisplayed = style.display !== 'none';
      const isVisibilityVisible = style.visibility !== 'hidden';
      const isInteractable = style.pointerEvents !== 'none';
      const isInViewport = rect.top >= 0 && rect.top <= window.innerHeight;
      const isNotDisabled = !el.disabled && !el.hasAttribute('disabled');

      if (!isVisible) return { isValid: false, reason: 'Element not visible (zero dimensions)' };
      if (!isDisplayed) return { isValid: false, reason: 'Element display is none' };
      if (!isVisibilityVisible) return { isValid: false, reason: 'Element visibility is hidden' };
      if (!isInteractable) return { isValid: false, reason: 'Element pointer-events is none' };
      if (!isNotDisabled) return { isValid: false, reason: 'Element is disabled' };

      return {
        isValid: true,
        isInViewport,
        elementType: el.tagName.toLowerCase(),
        hasText: !!el.textContent?.trim(),
        hasId: !!el.id,
        hasClickHandler: !!(el.onclick || el.getAttribute('onclick'))
      };
    }, element.selector);

    return validation;
  }

  /**
   * Select optimal strategies based on element characteristics
   */
  _selectOptimalStrategies(element) {
    const allStrategies = [
      { name: 'puppeteer', fn: () => this._puppeteerClick(element), priority: 1 },
      { name: 'evaluate', fn: () => this._evaluateClick(element), priority: 2 },
      { name: 'text-based', fn: () => this._textBasedClick(element), priority: 3 }
    ];

    // Adjust strategy priority based on element characteristics
    if (element.hasId || element.selector.startsWith('#')) {
      // Elements with IDs are more reliable for direct clicking
      allStrategies[0].priority = 0; // Boost puppeteer priority
    }

    if (!element.text || !element.hasText) {
      // No text means text-based strategy will fail
      allStrategies[2].priority = 10; // Lower text-based priority
    }

    if (element.hasClickHandler) {
      // Elements with click handlers work better with evaluate strategy
      allStrategies[1].priority = 0.5; // Boost evaluate priority
    }

    // Sort by priority (lower = higher priority)
    return allStrategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Strategy 1: Native Puppeteer click (optimized)
   */
  async _puppeteerClick(element) {
    try {
      const elementHandle = await this.page.$(element.selector);
      if (!elementHandle) {
        return { success: false, error: 'Element not found' };
      }

      // Ensure element is in viewport before clicking
      await elementHandle.scrollIntoViewIfNeeded();
      await elementHandle.click();
      await elementHandle.dispose(); // Clean up handle

      return { success: true, method: 'puppeteer' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Strategy 2: JavaScript click in page context (optimized)
   */
  async _evaluateClick(element) {
    const result = await this.page.evaluate(
      (selector, text) => {
        const el = document.querySelector(selector);
        if (!el) return { success: false, error: 'Element not found' };

        // Optional text verification (skip detailed visibility check since we pre-validated)
        if (text && !el.textContent?.includes(text)) {
          return { success: false, error: 'Text mismatch' };
        }

        // Scroll into view if needed before clicking
        if (!el.getBoundingClientRect().top || el.getBoundingClientRect().top < 0) {
          el.scrollIntoView({ behavior: 'auto', block: 'center' });
        }

        // Click the element
        el.click();
        return { success: true };
      },
      element.selector,
      element.text
    );

    return { success: result.success, method: 'evaluate', ...result };
  }

  /**
   * Strategy 3: Text-based fallback (optimized)
   */
  async _textBasedClick(element) {
    if (!element.text) {
      return { success: false, error: 'No text for fallback' };
    }

    const result = await this.page.evaluate(searchText => {
      const selectors = ['button', '[role="button"]', '.btn', '.button'];

      for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        const target = elements.find(el => {
          const textMatch = el.textContent?.toLowerCase().includes(searchText.toLowerCase());
          if (!textMatch) return false;

          // Quick visibility check (detailed check was done in pre-validation)
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        if (target) {
          // Scroll into view if needed
          if (target.getBoundingClientRect().top < 0) {
            target.scrollIntoView({ behavior: 'auto', block: 'center' });
          }
          target.click();
          return { success: true };
        }
      }

      return { success: false, error: 'No visible matching element found' };
    }, element.text);

    return { success: result.success, method: 'text-based', ...result };
  }

  /**
   * Smart network activity waiting (optimized)
   */
  async _waitForNetworkResponse(maxWait = 5000) {
    if (!this.networkMonitor || maxWait <= 0) return;

    try {
      // Start with shorter idle time and increase if needed
      const initialIdleTime = 500;
      const extendedIdleTime = 1000;

      // First try short wait for immediate responses
      await this.networkMonitor.waitForNetworkIdle(
        initialIdleTime,
        Math.min(maxWait * 0.3, 2000), // Use 30% of max wait for quick responses
        false
      );

      // If there's still time, wait a bit longer for slower responses
      const remainingTime = maxWait - maxWait * 0.3;
      if (remainingTime > 1000) {
        await this.networkMonitor.waitForNetworkIdle(extendedIdleTime, remainingTime, false);
      }
    } catch (error) {
      // Network timeout is not critical - continue
      console.log(`   ⚠️ Network wait timeout: ${error.message}`);
    }
  }
}
