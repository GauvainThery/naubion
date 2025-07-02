/**
 * Browser automation infrastructure - Puppeteer browser management
 *
 * Alpine Linux Configuration:
 * - Uses system-installed Chromium from Alpine packages
 * - Configured for Docker/Alpine environment with appropriate flags
 * - Follows Puppeteer Alpine troubleshooting guide: https://pptr.dev/troubleshooting#running-on-alpine
 */

import puppeteer, { Browser, LaunchOptions, Page } from 'puppeteer';
import {
  DEVICE_CONFIGURATIONS,
  DeviceConfiguration,
  PageAnalysisOptions
} from '../../domain/models/page-analysis.js';
import logger from '../../shared/logger.js';

export class BrowserManager {
  private browser: Browser | null = null;
  private userDataDir: string | null = null;

  /**
   * Launch browser with analysis options
   *
   * Alpine-specific configuration:
   * - Uses system Chromium from Alpine packages
   * - Includes Alpine-optimized launch arguments
   */
  async launch(options: PageAnalysisOptions): Promise<Browser> {
    // Generate unique user data directory to avoid singleton conflicts
    this.userDataDir = `${process.env.CHROME_CONFIG_DIR || '/home/naubion/.config/chromium'}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const launchOptions: LaunchOptions = {
      browser: 'chrome',
      // Use system Chromium from Alpine package
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      headless: true,
      args: [
        '--disable-extensions',
        '--disable-plugins',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-feature=WebFontsCacheAwareTimeoutAdaption',
        // Essential for Alpine/Docker environments
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        // Additional Docker-optimized flags
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--memory-pressure-off',
        '--max_old_space_size=512',
        // Connection stability improvements
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-background-timer-throttling',
        '--force-color-profile=srgb',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--disable-default-apps',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-first-run',
        // Disable crashpad to prevent "--database is required" error
        '--disable-crashpad',
        '--no-crash-upload',
        // Set unique data directory for each browser instance to avoid singleton conflicts
        `--user-data-dir=${this.userDataDir}`,
        `--disk-cache-dir=${process.env.CHROME_CACHE_DIR || '/home/naubion/.cache/chromium'}`,
        '--disable-background-networking',
        // Security flags for container environments (must come after user-data-dir)
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        // Process management flags
        '--disable-dev-shm-usage',
        '--disable-extensions-file-access-check',
        '--disable-plugins-discovery',
        // Timeout and stability flags
        '--timeout=60000',
        '--disable-hang-monitor'
      ]
    };

    // Add mobile-specific optimizations
    if (options.deviceType === 'mobile') {
      launchOptions.args?.push(
        '--enable-features=NetworkService,NetworkServiceLogging',
        '--force-device-scale-factor=1'
      );
    }

    this.browser = await puppeteer.launch(launchOptions);

    // Verify browser launched successfully
    if (!this.browser) {
      throw new Error('Failed to launch browser');
    }

    // Test browser connection
    try {
      const version = await this.browser.version();
      logger.debug('Browser launched successfully', {
        deviceType: options.deviceType,
        version,
        userDataDir: this.userDataDir
      });
    } catch (error) {
      logger.error('Browser launched but connection test failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      await this.browser.close();
      this.browser = null;
      throw error;
    }

    return this.browser;
  }

  /**
   * Create and configure a new page
   */
  async createPage(options: PageAnalysisOptions): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Creating new browser page (attempt ${attempt}/${maxRetries})...`);

        // Check browser is still connected before creating page
        if (!this.browser.isConnected()) {
          throw new Error('Browser is not connected - cannot create page');
        }

        const page = await this.browser.newPage();

        // Check if page was created successfully
        if (!page || page.isClosed()) {
          throw new Error('Failed to create browser page or page was immediately closed');
        }

        // Add a small delay to ensure page is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));

        // Double-check page is still valid after delay
        if (page.isClosed()) {
          throw new Error('Page was closed immediately after creation');
        }

        const deviceConfig = DEVICE_CONFIGURATIONS[options.deviceType];

        // Configure device settings with enhanced error handling
        await this.configurePageDevice(page, deviceConfig, options);

        // Set additional page configurations for stability
        await page.setDefaultNavigationTimeout(options.timeout || 60000);
        await page.setDefaultTimeout(30000);

        // Set request interception for better control
        await page.setRequestInterception(false); // Disable to avoid conflicts

        logger.debug('Page created and configured successfully', {
          deviceType: options.deviceType,
          viewport: deviceConfig.viewport,
          timeout: options.timeout,
          attempt
        });

        return page;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        logger.warn(`Failed to create page on attempt ${attempt}/${maxRetries}`, {
          error: lastError.message,
          deviceType: options.deviceType,
          browserConnected: this.browser?.isConnected() || false
        });

        // If this is not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // Exponential backoff
          logger.debug(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, throw the last error
    logger.error('Failed to create page after all retries', {
      error: lastError?.message,
      deviceType: options.deviceType,
      maxRetries
    });
    throw lastError || new Error('Unknown error during page creation');
  }

  /**
   * Configure page device settings
   */
  private async configurePageDevice(
    page: Page,
    config: DeviceConfiguration,
    options: PageAnalysisOptions
  ): Promise<void> {
    try {
      logger.debug('Configuring page device settings...', {
        viewport: config.viewport,
        isMobile: config.viewport.isMobile,
        deviceType: options.deviceType
      });

      // Multiple verification points to ensure page is still open
      if (page.isClosed()) {
        throw new Error('Cannot configure device settings - page is already closed');
      }

      // Wait a moment to ensure page is stable
      await new Promise(resolve => setTimeout(resolve, 50));

      // Check again after delay
      if (page.isClosed()) {
        throw new Error('Page was closed during initialization delay');
      }

      // Add error handlers for page events BEFORE setting viewport
      page.on('error', error => {
        logger.error('Page error occurred', { error: error.message });
      });

      page.on('pageerror', error => {
        logger.error('Page script error occurred', { error: error.message });
      });

      page.on('requestfailed', request => {
        logger.debug('Request failed', {
          url: request.url(),
          failure: request.failure()?.errorText
        });
      });

      // For desktop devices, always disable touch emulation to avoid protocol errors
      // For mobile devices, enable touch but with fallback handling
      const viewportConfig = { ...config.viewport };

      if (options.deviceType === 'desktop') {
        // Force disable touch for desktop to prevent emulation errors
        viewportConfig.hasTouch = false;
        viewportConfig.isMobile = false;
        logger.debug('Forced touch emulation disabled for desktop device');
      }

      // Final check before setting viewport
      if (page.isClosed()) {
        throw new Error('Page was closed before viewport configuration');
      }

      // Set viewport configuration with careful error handling
      // Note: page.setViewport() automatically calls Emulation.setTouchEmulationEnabled
      // when hasTouch is true, which can fail if the CDP session is closing
      try {
        await page.setViewport(viewportConfig);
        logger.debug('Viewport set successfully', {
          width: viewportConfig.width,
          height: viewportConfig.height,
          isMobile: viewportConfig.isMobile,
          hasTouch: viewportConfig.hasTouch
        });
      } catch (viewportError) {
        const errorMessage =
          viewportError instanceof Error ? viewportError.message : String(viewportError);

        // Check if this is the touch emulation error or session closure
        if (
          errorMessage.includes('Emulation.setTouchEmulationEnabled') ||
          errorMessage.includes('Session closed') ||
          errorMessage.includes('Target closed') ||
          errorMessage.includes('Connection closed')
        ) {
          logger.warn(
            'Touch emulation or session failed - attempting minimal viewport configuration',
            {
              error: errorMessage,
              isMobile: viewportConfig.isMobile,
              hasTouch: viewportConfig.hasTouch,
              deviceType: options.deviceType
            }
          );

          // If the page is already closed, don't try fallback
          if (page.isClosed()) {
            throw new Error('Page was closed during viewport configuration - cannot recover');
          }

          // Try a minimal viewport configuration without any emulation
          const minimalViewport = {
            width: viewportConfig.width,
            height: viewportConfig.height,
            deviceScaleFactor: 1, // Reset to default
            isMobile: false, // Always disable
            hasTouch: false // Always disable
          };

          try {
            await page.setViewport(minimalViewport);
            logger.debug('Minimal viewport set successfully as fallback');
          } catch (fallbackError) {
            const fallbackMessage =
              fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
            logger.error('Failed to set even minimal viewport configuration', {
              error: fallbackMessage,
              pageIsClosed: page.isClosed()
            });

            // If the page is closed, that's the real issue
            if (page.isClosed()) {
              throw new Error(
                'Page was closed during viewport configuration - browser session lost'
              );
            }

            throw fallbackError;
          }
        } else {
          // Re-throw other viewport errors
          logger.error('Viewport configuration failed with non-emulation error', {
            error: errorMessage,
            pageIsClosed: page.isClosed()
          });
          throw viewportError;
        }
      }

      logger.debug('Page device configuration completed successfully');
    } catch (error) {
      logger.error('Failed to configure page device settings', {
        error: error instanceof Error ? error.message : String(error),
        pageIsClosed: page.isClosed()
      });
      throw error;
    }
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.userDataDir = null;
      logger.debug('Browser closed');
    }
  }

  /**
   * Check if browser is active
   */
  isActive(): boolean {
    return this.browser !== null;
  }
}
