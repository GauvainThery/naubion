/**
 * Generic behavior simulator for common user interactions
 * Handles scrolling, hovering, and other user behaviors
 */

export class BehaviorSimulator {
  constructor(page, networkMonitor = null) {
    this.page = page;
    this.networkMonitor = networkMonitor;
  }

  /**
   * Simulate natural scrolling behavior
   */
  async simulateScrolling(options = {}) {
    const {
      maxSteps = 5,
      pauseBetweenScrolls = [800, 1200],
      scrollToTop = true,
      triggerLazyLoad = true
    } = options;

    console.log('📜 Simulating natural scrolling behavior...');

    const pageMetrics = await this.page.evaluate(() => ({
      height: document.body.scrollHeight,
      viewportHeight: window.innerHeight,
      width: document.body.scrollWidth,
      viewportWidth: window.innerWidth
    }));

    console.log(
      `📏 Page dimensions: ${pageMetrics.height}px height, ${pageMetrics.viewportHeight}px viewport`
    );

    const scrollSteps = Math.min(
      maxSteps,
      Math.ceil(pageMetrics.height / pageMetrics.viewportHeight)
    );
    const scrollAmount = pageMetrics.height / scrollSteps;

    for (let i = 0; i < scrollSteps; i++) {
      const scrollPosition = scrollAmount * (i + 1);
      console.log(`   Scrolling to position: ${Math.round(scrollPosition)}px`);

      await this.page.evaluate(position => {
        window.scrollTo({
          top: position,
          behavior: 'smooth'
        });
      }, scrollPosition);

      // Variable pause to simulate reading
      const pauseTime =
        pauseBetweenScrolls[0] + Math.random() * (pauseBetweenScrolls[1] - pauseBetweenScrolls[0]);
      await new Promise(resolve => setTimeout(resolve, pauseTime));

      // Check for lazy-loaded content if enabled
      if (triggerLazyLoad && this.networkMonitor) {
        await this._waitForLazyContent();
      }
    }

    if (scrollToTop) {
      console.log('   Scrolling back to top...');
      await this.page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { scrollSteps, totalHeight: pageMetrics.height };
  }

  /**
   * Simulate hover effects on elements
   */
  async simulateHoverEffects(elements, options = {}) {
    const { maxElements = 3, hoverDuration = 500 } = options;

    console.log('🖱️ Simulating hover effects...');

    const limitedElements = elements.slice(0, maxElements);

    for (const element of limitedElements) {
      try {
        console.log(`   Hovering over: "${element.text}"`);

        // Scroll to element if not visible
        if (!element.isVisible) {
          await this._scrollToElement(element);
        }

        await this.page.hover(element.selector);
        await new Promise(resolve => setTimeout(resolve, hoverDuration));

        // Check for network activity triggered by hover
        if (this.networkMonitor) {
          await this._waitForHoverContent();
        }
      } catch (error) {
        console.log(`     Failed to hover over "${element.text}": ${error.message}`);
      }
    }

    return { hoveredElements: limitedElements.length };
  }

  /**
   * Simulate focus events on interactive elements
   */
  async simulateFocusEvents(elements, options = {}) {
    const { maxElements = 3, focusDuration = 300 } = options;

    console.log('🎯 Simulating focus events...');

    const focusableElements = elements
      .filter(
        el =>
          ['input', 'textarea', 'select', 'button'].includes(el.tagName) ||
          el.role === 'button' ||
          el.dataAttributes.includes('tabindex')
      )
      .slice(0, maxElements);

    for (const element of focusableElements) {
      try {
        console.log(`   Focusing on: "${element.text}"`);

        await this.page.focus(element.selector);
        await new Promise(resolve => setTimeout(resolve, focusDuration));
      } catch (error) {
        console.log(`     Failed to focus on "${element.text}": ${error.message}`);
      }
    }

    return { focusedElements: focusableElements.length };
  }

  /**
   * Simulate typing in form fields
   */
  async simulateTyping(formElements, options = {}) {
    const { sampleText = 'test@example.com', typingSpeed = 100 } = options;

    console.log('⌨️ Simulating typing in form fields...');

    const textInputs = formElements.filter(
      el => ['input', 'textarea'].includes(el.tagName) && !el.isDisabled
    );

    for (const input of textInputs) {
      try {
        console.log(`   Typing in: "${input.text || input.selector}"`);

        await this.page.focus(input.selector);
        await this.page.type(input.selector, sampleText, {
          delay: typingSpeed
        });

        // Clear the field after typing
        await this.page.evaluate(selector => {
          const element = document.querySelector(selector);
          if (element && element.value !== undefined) {
            element.value = '';
          }
        }, input.selector);
      } catch (error) {
        console.log(`     Failed to type in "${input.text}": ${error.message}`);
      }
    }

    return { typedInElements: textInputs.length };
  }

  /**
   * Simulate viewport resize to test responsive behavior
   */
  async simulateViewportChanges(options = {}) {
    const {
      viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ],
      pauseBetweenChanges = 1000
    } = options;

    console.log('📱 Simulating viewport changes...');

    const originalViewport = await this.page.viewport();

    for (const viewport of viewports) {
      console.log(`   Changing viewport to: ${viewport.width}x${viewport.height}`);

      await this.page.setViewport(viewport);
      await new Promise(resolve => setTimeout(resolve, pauseBetweenChanges));

      // Check for responsive content loading
      if (this.networkMonitor) {
        await this._waitForResponsiveContent();
      }
    }

    // Restore original viewport
    if (originalViewport) {
      await this.page.setViewport(originalViewport);
    }

    return { viewportsTested: viewports.length };
  }

  /**
   * Simulate device capabilities like touch, orientation
   */
  async simulateDeviceCapabilities(options = {}) {
    const { simulateTouch = true, simulateOrientation = false } = options;

    console.log('📱 Simulating device capabilities...');

    if (simulateTouch) {
      await this.page.evaluate(() => {
        // Simulate touch capability
        Object.defineProperty(navigator, 'maxTouchPoints', {
          value: 5,
          writable: false
        });
      });
    }

    if (simulateOrientation) {
      await this.page.evaluate(() => {
        // Simulate orientation change
        window.dispatchEvent(new Event('orientationchange'));
      });
    }

    return {
      touchSimulated: simulateTouch,
      orientationSimulated: simulateOrientation
    };
  }

  // Private helper methods

  async _waitForLazyContent(timeout = 2000) {
    if (!this.networkMonitor) return;

    const resourceCountBefore = this.networkMonitor.getResources().length;
    await new Promise(resolve => setTimeout(resolve, 500));
    const resourceCountAfter = this.networkMonitor.getResources().length;

    if (resourceCountAfter > resourceCountBefore) {
      console.log(
        `     Lazy loading triggered ${resourceCountAfter - resourceCountBefore} resources`
      );
      await this.networkMonitor.waitForNetworkIdle(1000, timeout, false);
    }
  }

  async _waitForHoverContent(timeout = 1000) {
    if (!this.networkMonitor) return;

    await new Promise(resolve => setTimeout(resolve, 200));
    await this.networkMonitor.waitForNetworkIdle(500, timeout, false);
  }

  async _waitForResponsiveContent(timeout = 2000) {
    if (!this.networkMonitor) return;

    await new Promise(resolve => setTimeout(resolve, 300));
    await this.networkMonitor.waitForNetworkIdle(1000, timeout, false);
  }

  async _scrollToElement(element) {
    try {
      await this.page.evaluate(selector => {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, element.selector);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`     Failed to scroll to element: ${error.message}`);
    }
  }
}
