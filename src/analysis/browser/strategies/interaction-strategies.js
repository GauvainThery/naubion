/**
 * Generic interaction strategies for different types of elements
 * Each strategy is responsible for one specific way of interacting with elements
 */

export class InteractionStrategies {
  constructor(page, networkMonitor = null) {
    this.page = page;
    this.networkMonitor = networkMonitor;
  }

  /**
   * Strategy 1: Direct element interaction using Puppeteer's native methods
   */
  async directInteraction(element) {
    try {
      const elementHandle = await this.page.$(element.selector);
      if (elementHandle) {
        await elementHandle.click();
        return { success: true, method: 'direct' };
      }
    } catch (error) {
      return { success: false, method: 'direct', error: error.message };
    }
    return { success: false, method: 'direct', error: 'Element not found' };
  }

  /**
   * Strategy 2: Enhanced programmatic interaction with comprehensive event simulation
   */
  async programmaticInteraction(element) {
    try {
      const result = await this.page.evaluate(elementData => {
        const { selector, text } = elementData;
        const targetElement = document.querySelector(selector);

        if (!targetElement) {
          return { success: false, error: 'Element not found' };
        }

        // Verify element matches expected text
        if (text && !targetElement.textContent?.includes(text)) {
          return { success: false, error: 'Text mismatch' };
        }

        // Ensure element is interactive
        this._makeElementInteractive(targetElement);

        // Simulate comprehensive interaction
        this._simulateUserInteraction(targetElement);

        return { success: true, text: targetElement.textContent?.trim() };
      }, element);

      return { success: result.success, method: 'programmatic', ...result };
    } catch (error) {
      return { success: false, method: 'programmatic', error: error.message };
    }
  }

  /**
   * Strategy 3: Data-attribute based interaction for modern web apps
   */
  async dataAttributeInteraction(element) {
    if (!element.dataAttributes || element.dataAttributes.length === 0) {
      return {
        success: false,
        method: 'data-attribute',
        error: 'No data attributes'
      };
    }

    try {
      const result = await this.page.evaluate(elementData => {
        const { dataAttributes, text } = elementData;

        // Find elements with specific data attributes
        const dataSelectors = this._extractDataSelectors(dataAttributes);
        let targetElement = null;

        for (const selector of dataSelectors) {
          const elements = Array.from(document.querySelectorAll(selector));
          targetElement = elements.find(el => !text || el.textContent?.trim().includes(text));
          if (targetElement) break;
        }

        if (!targetElement) {
          return { success: false, error: 'No matching element found' };
        }

        this._makeElementInteractive(targetElement);
        this._simulateUserInteraction(targetElement);

        return {
          success: true,
          selector: this._getElementSelector(targetElement)
        };
      }, element);

      return { success: result.success, method: 'data-attribute', ...result };
    } catch (error) {
      return { success: false, method: 'data-attribute', error: error.message };
    }
  }

  /**
   * Strategy 4: Text-based element discovery and interaction
   */
  async textBasedInteraction(element) {
    if (!element.text) {
      return {
        success: false,
        method: 'text-based',
        error: 'No text provided'
      };
    }

    try {
      const result = await this.page.evaluate(searchText => {
        // Common button selectors
        const buttonSelectors = [
          'button',
          '[role="button"]',
          'input[type="button"]',
          'input[type="submit"]',
          '.btn',
          '.button'
        ];

        for (const selector of buttonSelectors) {
          const elements = Array.from(document.querySelectorAll(selector));
          const targetElement = elements.find(el =>
            el.textContent?.trim().toLowerCase().includes(searchText.toLowerCase())
          );

          if (targetElement) {
            this._makeElementInteractive(targetElement);
            this._simulateUserInteraction(targetElement);
            return {
              success: true,
              selector: this._getElementSelector(targetElement),
              matchedText: targetElement.textContent?.trim()
            };
          }
        }

        return { success: false, error: 'No matching text found' };
      }, element.text);

      return { success: result.success, method: 'text-based', ...result };
    } catch (error) {
      return { success: false, method: 'text-based', error: error.message };
    }
  }

  /**
   * Wait for network activity to settle after interaction
   */
  async waitForNetworkSettlement(resourceCountBefore, maxWaitTime = 30000) {
    if (!this.networkMonitor) return;

    const resourceCountAfter = this.networkMonitor.getResources().length;

    if (resourceCountAfter > resourceCountBefore) {
      console.log(
        `     Interaction triggered ${resourceCountAfter - resourceCountBefore} new resource(s)`
      );

      await this.networkMonitor.waitForNetworkIdle(
        3000, // 3 seconds of quiet time
        maxWaitTime,
        false // Less verbose for strategies
      );
    }
  }
}

// Helper functions that will be injected into the page context
const pageHelpers = `
  window._makeElementInteractive = function(element) {
    const style = window.getComputedStyle(element);
    if (style.pointerEvents === 'none') {
      element.style.pointerEvents = 'auto';
    }
    if (style.visibility === 'hidden') {
      element.style.visibility = 'visible';
    }
    if (style.display === 'none') {
      element.style.display = 'block';
    }
  };

  window._simulateUserInteraction = function(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const events = [
      new FocusEvent('focus', { bubbles: true }),
      new MouseEvent('mouseenter', { bubbles: true, cancelable: true, clientX: centerX, clientY: centerY }),
      new MouseEvent('mouseover', { bubbles: true, cancelable: true, clientX: centerX, clientY: centerY }),
      new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: centerX, clientY: centerY, button: 0 }),
      new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: centerX, clientY: centerY, button: 0 }),
      new MouseEvent('click', { bubbles: true, cancelable: true, clientX: centerX, clientY: centerY, button: 0 })
    ];

    events.forEach(event => {
      try {
        element.dispatchEvent(event);
      } catch (e) {
        // Ignore unsupported events
      }
    });

    // Try direct click as backup
    if (typeof element.click === 'function') {
      element.click();
    }
  };

  window._extractDataSelectors = function(dataAttributes) {
    const selectors = [];
    const attributes = dataAttributes.split(' ');
    
    attributes.forEach(attr => {
      if (attr.includes('=')) {
        const [name, value] = attr.split('=');
        const cleanValue = value.replace(/"/g, '');
        selectors.push(\`[\${name}="\${cleanValue}"]\`);
        selectors.push(\`[\${name}*="\${cleanValue}"]\`);
      }
    });
    
    return selectors;
  };

  window._getElementSelector = function(element) {
    if (element.id) return \`#\${element.id}\`;
    if (element.className) return \`.\${element.className.split(' ')[0]}\`;
    return element.tagName.toLowerCase();
  };
`;

// Inject helper functions into page context
export async function injectPageHelpers(page) {
  await page.evaluate(pageHelpers);
}
