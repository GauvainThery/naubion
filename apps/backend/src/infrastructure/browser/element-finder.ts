/**
 * Element finder infrastructure - Smart element discovery strategies
 */

import { Page } from 'puppeteer';
import { ElementInfo } from './interaction-strategies';

// Type definitions for browser helper functions
interface FindElementsConfig {
  maxElements?: number;
  mustBeVisible?: boolean;
  excludeNavigation?: boolean;
}

interface SmartSelector {
  selector: string;
  confidence: number;
}

interface HTMLElementWithOnClick extends HTMLElement {
  onclick: ((this: GlobalEventHandlers, ev: MouseEvent) => unknown) | null;
}

interface WindowWithHelpers extends Window {
  _findElementsBySelectors: (
    selectors: string[],
    type: string,
    config: FindElementsConfig
  ) => ElementInfo[];
  _createElement: (element: HTMLElement, id: string, type: string) => ElementInfo;
  _getBestSelector: (element: HTMLElement) => string;
  _getDataAttributes: (element: HTMLElement) => string;
  _isNavigationElement: (element: HTMLElement) => boolean;
  _isElementInteractive: (element: HTMLElement) => boolean;
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
      const windowTyped = window as unknown as WindowWithHelpers;
      const buttons = windowTyped._findElementsBySelectors(
        ['button', 'input[type="button"]', 'input[type="submit"]', '[role="button"]'],
        'button',
        { maxElements: 10, mustBeVisible: true }
      );

      const links = windowTyped._findElementsBySelectors(['a[href]', '[role="link"]'], 'link', {
        maxElements: 8,
        mustBeVisible: true
      });

      const inputs = windowTyped._findElementsBySelectors(
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
        const windowTyped = window as unknown as WindowWithHelpers;
        return windowTyped._findElementsBySelectors(selectors, type, config);
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
      const smartSelectors: SmartSelector[] = [
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

      const foundElements: ElementInfo[] = [];
      const windowTyped = window as unknown as WindowWithHelpers;

      smartSelectors.forEach(({ selector, confidence }) => {
        const elements = document.querySelectorAll(selector);
        Array.from(elements).forEach((el: Element, index) => {
          if (
            windowTyped._isNavigationElement &&
            windowTyped._isNavigationElement(el as HTMLElement)
          ) {
            return; // Skip navigation elements
          }

          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;

          if (isVisible) {
            const element = windowTyped._createElement(
              el as HTMLElement,
              `smart_${selector}_${index}`,
              'smart'
            );
            element.confidence = confidence;
            foundElements.push(element);
          }
        });
      });

      // Sort by confidence and return top elements
      return foundElements.sort((a, b) => (b.confidence || 0) - (a.confidence || 0)).slice(0, 15);
    });
  }

  /**
   * Inject helper functions into page context
   */
  private async injectHelpers(): Promise<void> {
    await this.page.evaluate(() => {
      // Only inject if not already present
      if ('_findElementsBySelectors' in window) return;

      const windowTyped = window as unknown as WindowWithHelpers;

      windowTyped._findElementsBySelectors = function (
        selectors: string[],
        type: string,
        config: FindElementsConfig = {}
      ): ElementInfo[] {
        const { maxElements = 5, mustBeVisible = true, excludeNavigation = true } = config;
        const foundElements: ElementInfo[] = [];

        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          Array.from(elements).forEach((el: Element, index) => {
            if (excludeNavigation && windowTyped._isNavigationElement(el as HTMLElement)) {
              return;
            }

            const rect = el.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;

            if (!mustBeVisible || isVisible) {
              foundElements.push(
                windowTyped._createElement(el as HTMLElement, `${type}_${index}`, type)
              );
            }
          });
        });

        return foundElements.slice(0, maxElements);
      };

      windowTyped._createElement = function (
        element: HTMLElement,
        id: string,
        type: string
      ): ElementInfo {
        const rect = element.getBoundingClientRect();

        return {
          id,
          type,
          text: element.textContent?.trim().substring(0, 50) || '',
          selector: windowTyped._getBestSelector(element),
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
          dataAttributes: windowTyped._getDataAttributes(element),
          isDisabled:
            (element as HTMLInputElement).disabled || element.getAttribute('disabled') !== null,
          hasClickHandler:
            !!(element as HTMLElementWithOnClick).onclick || !!element.getAttribute('onclick'),
          ariaLabel: element.getAttribute('aria-label') || '',
          role: element.getAttribute('role') || '',
          isInteractive: windowTyped._isElementInteractive(element)
        };
      };

      windowTyped._getBestSelector = function (element: HTMLElement): string {
        if (element.id) return `#${element.id}`;
        if (element.className) {
          const firstClass = element.className.split(' ')[0];
          if (firstClass) return `.${firstClass}`;
        }
        return element.tagName.toLowerCase();
      };

      windowTyped._getDataAttributes = function (element: HTMLElement): string {
        return Array.from(element.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(' ');
      };

      windowTyped._isNavigationElement = function (element: HTMLElement): boolean {
        const navigationKeywords = ['download', 'link', 'external', 'href', 'navigate', 'redirect'];
        const text = element.textContent?.toLowerCase() || '';
        const hasHref = !!(element.getAttribute('href') || element.closest('a'));

        return hasHref || navigationKeywords.some(keyword => text.includes(keyword));
      };

      windowTyped._isElementInteractive = function (element: HTMLElement): boolean {
        const interactive = ['button', 'input', 'select', 'textarea', 'a', 'details', 'summary'];

        const isInteractiveTag = interactive.includes(element.tagName.toLowerCase());
        const hasInteractiveRole =
          element.getAttribute('role') === 'button' || element.getAttribute('role') === 'link';
        const hasClickHandler =
          !!(element as HTMLElementWithOnClick).onclick || !!element.getAttribute('onclick');
        const hasTabIndex = element.getAttribute('tabindex') !== null;

        return isInteractiveTag || hasInteractiveRole || hasClickHandler || hasTabIndex;
      };
    });
  }
}
