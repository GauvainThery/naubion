/**
 * Element finder infrastructure - Smart element discovery strategies
 */

import { Page } from 'puppeteer';

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

export class ElementFinder {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Find all interactive elements on the page
   */
  async findInteractiveElements(): Promise<{
    buttons: ElementInfo[];
    links: ElementInfo[];
    inputs: ElementInfo[];
  }> {
    await this.injectHelpers();

    return await this.page.evaluate(() => {
      const buttons = (window as any)._findElementsBySelectors(
        ['button', 'input[type="button"]', 'input[type="submit"]', '[role="button"]'],
        'button',
        { maxElements: 10, mustBeVisible: true }
      );

      const links = (window as any)._findElementsBySelectors(['a[href]', '[role="link"]'], 'link', {
        maxElements: 8,
        mustBeVisible: true
      });

      const inputs = (window as any)._findElementsBySelectors(
        ['input', 'textarea', 'select'],
        'input',
        { maxElements: 5, mustBeVisible: true }
      );

      return { buttons, links, inputs };
    });
  }

  /**
   * Find specific types of elements based on configuration
   */
  async findElementsByType(
    type: string,
    config: { maxElements?: number; mustBeVisible?: boolean } = {}
  ): Promise<ElementInfo[]> {
    await this.injectHelpers();

    const selectorMap: Record<string, string[]> = {
      buttons: ['button', 'input[type="button"]', 'input[type="submit"]', '[role="button"]'],
      links: ['a[href]', '[role="link"]'],
      inputs: ['input', 'textarea', 'select'],
      navigation: ['nav a', '.navigation a', '.menu a', '[role="navigation"] a']
    };

    const selectors = selectorMap[type] || [type];

    return await this.page.evaluate(
      (selectors, type, config) => {
        return (window as any)._findElementsBySelectors(selectors, type, config);
      },
      selectors,
      type,
      config
    );
  }

  /**
   * Smart element detection based on common patterns
   */
  async findSmartElements(): Promise<ElementInfo[]> {
    await this.injectHelpers();

    return await this.page.evaluate(() => {
      const smartSelectors = [
        // High-value interactive elements
        { selector: '[data-testid]', confidence: 0.9 },
        { selector: '[data-track]', confidence: 0.8 },
        { selector: '.cta, .call-to-action', confidence: 0.9 },
        { selector: '.button, .btn', confidence: 0.8 },
        { selector: '[onclick]', confidence: 0.7 },

        // Content interaction
        { selector: '.tab, [role="tab"]', confidence: 0.6 },
        { selector: '.accordion, [role="button"][aria-expanded]', confidence: 0.6 },
        { selector: '.modal-trigger, [data-modal]', confidence: 0.7 },

        // Navigation
        { selector: '.menu-item, .nav-item', confidence: 0.5 },
        { selector: '[aria-label*="menu"], [aria-label*="navigation"]', confidence: 0.6 }
      ];

      const foundElements: any[] = [];

      smartSelectors.forEach(({ selector, confidence }) => {
        const elements = document.querySelectorAll(selector);
        Array.from(elements).forEach((el: any, index) => {
          if ((window as any)._isNavigationElement && (window as any)._isNavigationElement(el)) {
            return; // Skip navigation elements
          }

          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;

          if (isVisible) {
            const element = (window as any)._createElement(
              el,
              `smart_${selector}_${index}`,
              'smart'
            );
            element.confidence = confidence;
            foundElements.push(element);
          }
        });
      });

      // Sort by confidence and return top elements
      return foundElements.sort((a, b) => b.confidence - a.confidence).slice(0, 15);
    });
  }

  /**
   * Inject helper functions into page context
   */
  private async injectHelpers(): Promise<void> {
    await this.page.evaluate(() => {
      // Only inject if not already present
      if ((window as any)._findElementsBySelectors) return;

      (window as any)._findElementsBySelectors = function (
        selectors: string[],
        type: string,
        config: any = {}
      ) {
        const { maxElements = 5, mustBeVisible = true, excludeNavigation = true } = config;
        const foundElements: any[] = [];

        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          Array.from(elements).forEach((el: any, index) => {
            if (excludeNavigation && (window as any)._isNavigationElement(el)) {
              return;
            }

            const rect = el.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;

            if (!mustBeVisible || isVisible) {
              foundElements.push((window as any)._createElement(el, `${type}_${index}`, type));
            }
          });
        });

        return foundElements.slice(0, maxElements);
      };

      (window as any)._createElement = function (element: HTMLElement, id: string, type: string) {
        const rect = element.getBoundingClientRect();

        return {
          id: id,
          type: type,
          text: element.textContent?.trim().substring(0, 50) || '',
          selector: (window as any)._getBestSelector(element),
          tagName: element.tagName.toLowerCase(),
          className: element.className || '',
          elementId: element.id || '',
          isVisible:
            rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top <= window.innerHeight,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height
          },
          dataAttributes: (window as any)._getDataAttributes(element),
          isDisabled: (element as any).disabled || element.getAttribute('disabled') !== null,
          hasClickHandler: !!(element as any).onclick || !!element.getAttribute('onclick'),
          ariaLabel: element.getAttribute('aria-label') || '',
          role: element.getAttribute('role') || '',
          isInteractive: (window as any)._isElementInteractive(element)
        };
      };

      (window as any)._getBestSelector = function (element: HTMLElement) {
        if (element.id) return `#${element.id}`;
        if (element.className) {
          const firstClass = element.className.split(' ')[0];
          if (firstClass) return `.${firstClass}`;
        }
        return element.tagName.toLowerCase();
      };

      (window as any)._getDataAttributes = function (element: HTMLElement) {
        return Array.from(element.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(' ');
      };

      (window as any)._isNavigationElement = function (element: HTMLElement) {
        const navigationKeywords = ['download', 'link', 'external', 'href', 'navigate', 'redirect'];
        const text = element.textContent?.toLowerCase() || '';
        const hasHref = element.getAttribute('href') || element.closest('a');

        return hasHref || navigationKeywords.some(keyword => text.includes(keyword));
      };

      (window as any)._isElementInteractive = function (element: HTMLElement) {
        const interactive = ['button', 'input', 'select', 'textarea', 'a', 'details', 'summary'];

        const isInteractiveTag = interactive.includes(element.tagName.toLowerCase());
        const hasInteractiveRole =
          element.getAttribute('role') === 'button' || element.getAttribute('role') === 'link';
        const hasClickHandler = !!(element as any).onclick || !!element.getAttribute('onclick');
        const hasTabIndex = element.getAttribute('tabindex') !== null;

        return isInteractiveTag || hasInteractiveRole || hasClickHandler || hasTabIndex;
      };
    });
  }
}
