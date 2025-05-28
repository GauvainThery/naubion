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

    // Main interaction logic
    const interactionPromise = this._attemptClick(element);

    try {
      const result = await Promise.race([interactionPromise, timeoutPromise]);
      const duration = Date.now() - startTime;

      if (result.success) {
        console.log(`   ✅ Clicked "${element.text}" in ${duration}ms using ${result.method}`);

        // Wait for any network activity to settle
        await this._waitForNetworkResponse(timeout - duration);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ Failed to click "${element.text}" after ${duration}ms: ${error.message}`);
      return { success: false, error: error.message, duration };
    }
  }

  /**
   * Attempt click using multiple fallback strategies
   */
  async _attemptClick(element) {
    const strategies = [
      () => this._puppeteerClick(element),
      () => this._evaluateClick(element),
      () => this._textBasedClick(element)
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = await strategies[i]();
        if (result.success) {
          return result;
        }
      } catch (error) {
        // Continue to next strategy
        if (i === strategies.length - 1) {
          throw error; // Last strategy failed
        }
      }
    }

    return { success: false, error: 'All strategies failed' };
  }

  /**
   * Strategy 1: Native Puppeteer click
   */
  async _puppeteerClick(element) {
    const elementHandle = await this.page.$(element.selector);
    if (!elementHandle) {
      return { success: false, error: 'Element not found' };
    }

    await elementHandle.click();
    return { success: true, method: 'puppeteer' };
  }

  /**
   * Strategy 2: JavaScript click in page context
   */
  async _evaluateClick(element) {
    const result = await this.page.evaluate(
      (selector, text) => {
        const el = document.querySelector(selector);
        if (!el) return { success: false, error: 'Element not found' };

        // Optional text verification
        if (text && !el.textContent?.includes(text)) {
          return { success: false, error: 'Text mismatch' };
        }

        // Check if element is actually visible and interactable (like a real user would)
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const computedStyle = window.getComputedStyle(el);
        const isDisplayed = computedStyle.display !== 'none';
        const isVisibilityVisible = computedStyle.visibility !== 'hidden';
        const isInteractable = computedStyle.pointerEvents !== 'none';

        if (!isVisible || !isDisplayed || !isVisibilityVisible || !isInteractable) {
          return { success: false, error: 'Element not visible or interactable' };
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
   * Strategy 3: Text-based fallback
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

          // Check if element is visible and interactable (like a real user would see it)
          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          const computedStyle = window.getComputedStyle(el);
          const isDisplayed = computedStyle.display !== 'none';
          const isVisibilityVisible = computedStyle.visibility !== 'hidden';
          const isInteractable = computedStyle.pointerEvents !== 'none';

          return isVisible && isDisplayed && isVisibilityVisible && isInteractable;
        });

        if (target) {
          target.click();
          return { success: true };
        }
      }

      return { success: false, error: 'No visible matching element found' };
    }, element.text);

    return { success: result.success, method: 'text-based', ...result };
  }

  /**
   * Wait for network activity after interaction (with timeout)
   */
  async _waitForNetworkResponse(maxWait = 5000) {
    if (!this.networkMonitor || maxWait <= 0) return;

    try {
      await this.networkMonitor.waitForNetworkIdle(
        1000, // 1 second quiet time
        Math.min(maxWait, 5000), // Max 5 seconds
        false // Not verbose
      );
    } catch (error) {
      // Network timeout is not critical - continue
      console.log(`   ⚠️ Network wait timeout: ${error.message}`);
    }
  }
}
