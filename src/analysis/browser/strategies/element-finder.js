/**
 * Generic element discovery and classification
 * Responsible for finding and categorizing interactive elements on a page
 */

export class ElementFinder {
  constructor(page) {
    this.page = page;
  }

  /**
   * Find all interactive elements on the page
   */
  async findInteractiveElements() {
    const elements = await this.page.evaluate(() => {
      const buttonSelectors = [
        'button:not([disabled])',
        '[role="button"]:not(a):not([disabled])',
        'input[type="button"]:not([disabled])',
        'input[type="submit"]:not([disabled])',
        '.btn:not(a):not([disabled])',
        '.button:not(a):not([disabled])',
        '[onclick]:not(a):not([disabled])',
        'div[role="button"]:not([disabled])',
        'span[role="button"]:not([disabled])'
      ];

      const hoverSelectors = [
        '[onmouseover]',
        '[onmouseenter]',
        '.dropdown',
        '.menu-item',
        '.nav-item',
        '[data-hover]',
        '.tooltip-trigger'
      ];

      const triggerSelectors = [
        '[data-toggle]:not(a)',
        '[aria-haspopup="true"]:not(a)',
        '.menu-toggle:not(a)',
        '.hamburger:not(a)',
        '[data-target]:not(a)'
      ];

      return {
        buttons: this._findElementsBySelectors(buttonSelectors, 'button'),
        hoverElements: this._findElementsBySelectors(hoverSelectors, 'hover'),
        triggers: this._findElementsBySelectors(triggerSelectors, 'trigger')
      };
    });

    return elements;
  }

  /**
   * Find specific types of elements based on configuration
   */
  async findElementsByType(type, config = {}) {
    const { maxElements = 5, mustBeVisible = true, excludeNavigation = true } = config;

    return await this.page.evaluate(
      (type, config) => {
        const selectorMap = {
          buttons: [
            'button:not([disabled])',
            '[role="button"]:not(a):not([disabled])',
            'input[type="button"]:not([disabled])',
            'input[type="submit"]:not([disabled])',
            '.btn:not(a):not([disabled])',
            '.button:not(a):not([disabled])',
            '[onclick]:not(a):not([disabled])',
            'div[role="button"]:not([disabled])',
            'span[role="button"]:not([disabled])'
          ],
          forms: [
            'form',
            'input[type="text"]',
            'input[type="email"]',
            'input[type="search"]',
            'textarea',
            'select'
          ],
          media: [
            'video',
            'audio',
            'img[data-src]', // Lazy loaded images
            'picture',
            'canvas'
          ],
          interactive: ['[tabindex]', '[contenteditable="true"]', 'details', 'summary']
        };

        const selectors = selectorMap[type] || selectorMap.buttons;
        return this._findElementsBySelectors(selectors, type, config);
      },
      type,
      { maxElements, mustBeVisible, excludeNavigation }
    );
  }

  /**
   * Find elements with specific data attributes
   */
  async findElementsByDataAttributes(attributePatterns) {
    return await this.page.evaluate(patterns => {
      const elements = [];

      patterns.forEach(pattern => {
        const selector = `[${pattern}]`;
        const found = document.querySelectorAll(selector);

        Array.from(found).forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            elements.push(this._createElement(el, `${pattern}_${index}`, 'data-attribute'));
          }
        });
      });

      return elements.slice(0, 10); // Limit results
    }, attributePatterns);
  }

  /**
   * Smart element detection based on common patterns
   */
  async findSmartElements() {
    return await this.page.evaluate(() => {
      const smartPatterns = [
        // Common button patterns
        { selector: '[class*="btn"]', type: 'button', weight: 0.9 },
        { selector: '[class*="button"]', type: 'button', weight: 0.9 },
        { selector: '[data-action]', type: 'action', weight: 0.8 },
        { selector: '[data-click]', type: 'clickable', weight: 0.8 },

        // Navigation patterns
        { selector: '[class*="menu"]', type: 'navigation', weight: 0.7 },
        { selector: '[class*="nav"]', type: 'navigation', weight: 0.7 },

        // Modal/popup patterns
        { selector: '[class*="modal"]', type: 'modal', weight: 0.6 },
        { selector: '[class*="popup"]', type: 'popup', weight: 0.6 },
        { selector: '[class*="dialog"]', type: 'dialog', weight: 0.6 },

        // Form patterns
        { selector: '[class*="form"]', type: 'form', weight: 0.5 },
        { selector: '[class*="input"]', type: 'input', weight: 0.4 }
      ];

      const foundElements = [];

      smartPatterns.forEach(pattern => {
        const elements = document.querySelectorAll(pattern.selector);
        Array.from(elements).forEach((el, index) => {
          if (this._isElementInteractive(el)) {
            const element = this._createElement(el, `${pattern.type}_${index}`, pattern.type);
            element.confidence = pattern.weight;
            foundElements.push(element);
          }
        });
      });

      // Sort by confidence and return top elements
      return foundElements.sort((a, b) => b.confidence - a.confidence).slice(0, 15);
    });
  }
}

// Helper functions to be injected into page context
const elementFinderHelpers = `
  window._findElementsBySelectors = function(selectors, type, config = {}) {
    const { maxElements = 5, mustBeVisible = true, excludeNavigation = true } = config;
    const foundElements = [];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      Array.from(elements).forEach((el, index) => {
        if (excludeNavigation && this._isNavigationElement(el)) {
          return;
        }

        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        if (!mustBeVisible || isVisible) {
          foundElements.push(this._createElement(el, \`\${type}_\${index}\`, type));
        }
      });
    });

    return foundElements.slice(0, maxElements);
  };

  window._createElement = function(element, id, type) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return {
      id: id,
      type: type,
      text: element.textContent?.trim().substring(0, 50) || '',
      selector: this._getBestSelector(element),
      tagName: element.tagName.toLowerCase(),
      className: element.className || '',
      elementId: element.id || '',
      isVisible: rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top <= window.innerHeight,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      },
      dataAttributes: this._getDataAttributes(element),
      isDisabled: element.disabled || element.getAttribute('disabled') !== null,
      hasClickHandler: !!element.onclick || !!element.getAttribute('onclick'),
      ariaLabel: element.getAttribute('aria-label') || '',
      role: element.getAttribute('role') || '',
      isInteractive: this._isElementInteractive(element)
    };
  };

  window._getBestSelector = function(element) {
    if (element.id) return \`#\${element.id}\`;
    if (element.className) {
      const firstClass = element.className.split(' ')[0];
      if (firstClass) return \`.\${firstClass}\`;
    }
    return element.tagName.toLowerCase();
  };

  window._getDataAttributes = function(element) {
    return Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('data-'))
      .map(attr => \`\${attr.name}="\${attr.value}"\`)
      .join(' ');
  };

  window._isNavigationElement = function(element) {
    const navigationKeywords = ['download', 'link', 'external', 'href', 'navigate', 'redirect'];
    const text = element.textContent?.toLowerCase() || '';
    const hasHref = element.getAttribute('href') || element.closest('a');
    
    return hasHref || navigationKeywords.some(keyword => text.includes(keyword));
  };

  window._isElementInteractive = function(element) {
    const interactive = [
      'button', 'input', 'select', 'textarea', 'a', 'details', 'summary'
    ];
    
    const isInteractiveTag = interactive.includes(element.tagName.toLowerCase());
    const hasInteractiveRole = element.getAttribute('role') === 'button' || 
                              element.getAttribute('role') === 'link';
    const hasClickHandler = !!element.onclick || !!element.getAttribute('onclick');
    const hasTabIndex = element.getAttribute('tabindex') !== null;
    
    return isInteractiveTag || hasInteractiveRole || hasClickHandler || hasTabIndex;
  };
`;

// Inject helper functions into page context
export async function injectElementFinderHelpers(page) {
  await page.evaluate(elementFinderHelpers);
}
