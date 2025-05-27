/**
 * Main application module
 * Orchestrates the page weight analyzer application
 */

import { FormHandler } from './ui/form.js';

/**
 * Main application class
 */
export class App {
  constructor() {
    this.formHandler = null;
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  /**
   * Initialize all application components
   */
  initializeComponents() {
    try {
      // Initialize form handler
      this.formHandler = new FormHandler();

      console.log('Green Web Compass initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Green Web Compass:', error);
    }
  }
}

// Initialize the application
new App();
