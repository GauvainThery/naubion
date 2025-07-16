/**
 * Bot Detection Service - Detects if a page is showing bot detection/captcha content
 * This service analyzes page content to identify if the analysis might not reflect the real page
 */

import { Page } from 'puppeteer';
import logger from '../../shared/logger.js';
import { BotDetectionResult, BotDetectionIndicator } from '../../domain/models/bot-detection.js';

export interface BotDetectionConfig {
  enableDetection: boolean;
  timeoutMs: number;
  checkInterval: number;
}

export class BotDetectionService {
  private config: BotDetectionConfig;

  constructor(config: Partial<BotDetectionConfig> = {}) {
    this.config = {
      enableDetection: true,
      timeoutMs: 5000,
      checkInterval: 1000,
      ...config
    };
  }

  /**
   * Analyze page for bot detection indicators
   */
  async detectBotBlocking(page: Page): Promise<BotDetectionResult> {
    if (!this.config.enableDetection) {
      return {
        detected: false,
        confidence: 0,
        indicators: []
      };
    }

    try {
      logger.debug('Starting bot detection analysis');

      const indicators: BotDetectionIndicator[] = [];

      // Wait a moment for dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check various bot detection indicators
      const checks = await Promise.allSettled([
        this.checkForCaptcha(page),
        this.checkForAccessDenied(page),
        this.checkForCloudflareChallenge(page),
        this.checkForSuspiciousRedirects(page),
        this.checkForRateLimit(page),
        this.checkForSuspiciousContent(page)
      ]);

      // Collect all indicators from successful checks
      checks.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          indicators.push(result.value);
        }
      });

      // Calculate confidence based on indicators found
      const detectedIndicators = indicators.filter(i => i.found);
      const confidence = this.calculateConfidence(detectedIndicators);
      const detected = confidence > 0.3; // Threshold for detection

      const result: BotDetectionResult = {
        detected,
        confidence,
        indicators,
        message: detected ? this.generateWarningMessage(detectedIndicators) : undefined
      };

      logger.debug('Bot detection completed', {
        detected,
        confidence,
        indicatorCount: detectedIndicators.length
      });

      return result;
    } catch (error) {
      logger.warn('Bot detection failed', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        detected: false,
        confidence: 0,
        indicators: [],
        message: 'Bot detection analysis failed'
      };
    }
  }

  /**
   * Check for CAPTCHA elements
   */
  private async checkForCaptcha(page: Page): Promise<BotDetectionIndicator> {
    try {
      const captchaFound = await page.evaluate(() => {
        // Check for common CAPTCHA selectors
        const captchaSelectors = [
          '.g-recaptcha',
          '.h-captcha',
          '[data-captcha]',
          '#captcha',
          '.captcha',
          'iframe[src*="recaptcha"]',
          'iframe[src*="hcaptcha"]',
          '.cf-captcha-container',
          '.captcha-container',
          '[aria-label*="captcha" i]',
          '[title*="captcha" i]'
        ];

        for (const selector of captchaSelectors) {
          const element = document.querySelector(selector);
          if (element && (element as HTMLElement).offsetParent !== null) {
            return { found: true, selector, text: element.textContent?.slice(0, 100) || '' };
          }
        }

        // Check for CAPTCHA-related text
        const captchaTexts = [
          'verify you are human',
          'prove you are not a robot',
          'complete the captcha',
          'security check',
          'verify your identity',
          'anti-robot verification'
        ];

        const bodyText = document.body.textContent?.toLowerCase() || '';
        for (const text of captchaTexts) {
          if (bodyText.includes(text)) {
            return { found: true, text };
          }
        }

        return { found: false };
      });

      return {
        type: 'captcha',
        found: captchaFound.found,
        details: captchaFound.found
          ? `CAPTCHA detected: ${captchaFound.text || captchaFound.selector}`
          : undefined,
        element: captchaFound.found ? captchaFound.selector : undefined
      };
    } catch (error) {
      logger.debug('CAPTCHA check failed', { error });
      return { type: 'captcha', found: false };
    }
  }

  /**
   * Check for access denied messages
   */
  private async checkForAccessDenied(page: Page): Promise<BotDetectionIndicator> {
    try {
      const accessDeniedFound = await page.evaluate(() => {
        const deniedTexts = [
          'access denied',
          'access forbidden',
          'forbidden',
          '403 forbidden',
          "you don't have permission",
          'unauthorized access',
          'blocked',
          'this site is protected',
          'suspicious activity detected'
        ];

        const bodyText = document.body.textContent?.toLowerCase() || '';
        const title = document.title.toLowerCase();

        for (const text of deniedTexts) {
          if (bodyText.includes(text) || title.includes(text)) {
            return { found: true, matchedText: text };
          }
        }

        return { found: false };
      });

      return {
        type: 'access_denied',
        found: accessDeniedFound.found,
        details: accessDeniedFound.found
          ? `Access denied message detected: "${accessDeniedFound.matchedText}"`
          : undefined
      };
    } catch (error) {
      logger.debug('Access denied check failed', { error });
      return { type: 'access_denied', found: false };
    }
  }

  /**
   * Check for Cloudflare challenge pages
   */
  private async checkForCloudflareChallenge(page: Page): Promise<BotDetectionIndicator> {
    try {
      // First check the current URL for Cloudflare challenge patterns
      const currentUrl = page.url();
      const cloudflareUrlPatterns = [
        'challenges.cloudflare.com',
        'cdn-cgi/challenge-platform',
        'cdn-cgi/challenge',
        '/cdn-cgi/l/chk_captcha',
        '/cdn-cgi/l/chk_jschl',
        'ray=' // Cloudflare ray ID in URL
      ];

      const foundUrlPattern = cloudflareUrlPatterns.find(pattern =>
        currentUrl.toLowerCase().includes(pattern)
      );

      if (foundUrlPattern) {
        return {
          type: 'cloudflare_challenge',
          found: true,
          details: `Cloudflare challenge URL detected: ${foundUrlPattern}`,
          element: 'url'
        };
      }

      const cloudflareFound = await page.evaluate(() => {
        // Check for Cloudflare challenge indicators
        const cfSelectors = [
          '.cf-browser-verification',
          '.cf-checking-browser',
          '#cf-challenge-running',
          '.cf-challenge-form',
          '.cf-captcha-container',
          '.challenge-form',
          '[data-ray]', // Cloudflare ray ID
          '[class*="cloudflare"]',
          '[id*="cloudflare"]',
          '.cf-wrapper',
          '.cf-column',
          '.cf-section'
        ];

        for (const selector of cfSelectors) {
          if (document.querySelector(selector)) {
            return { found: true, selector };
          }
        }

        // Check for Cloudflare text indicators
        const bodyText = document.body.textContent?.toLowerCase() || '';
        const title = document.title.toLowerCase();
        const cfTexts = [
          'checking your browser',
          'cloudflare',
          'ddos protection',
          'security check required',
          'please wait while we verify',
          'browser verification',
          'verify you are human',
          'just a moment',
          'please enable javascript',
          'enable cookies',
          'challenge running',
          'checking if the site connection is secure',
          'ray id'
        ];

        for (const text of cfTexts) {
          if (bodyText.includes(text) || title.includes(text)) {
            return { found: true, text };
          }
        }

        // Check for meta tags that might indicate Cloudflare
        const metaTags = document.querySelectorAll('meta[name], meta[property]');
        for (const meta of metaTags) {
          const content = (meta as HTMLMetaElement).content?.toLowerCase() || '';
          const metaElement = meta as HTMLMetaElement;
          const nameAttr = metaElement.name || metaElement.getAttribute('property');
          const name = nameAttr?.toLowerCase() || '';
          if (content.includes('cloudflare') || name.includes('cloudflare')) {
            return { found: true, meta: name };
          }
        }

        return { found: false };
      });

      return {
        type: 'cloudflare_challenge',
        found: cloudflareFound.found,
        details: cloudflareFound.found
          ? `Cloudflare challenge detected: ${cloudflareFound.text || cloudflareFound.selector || cloudflareFound.meta}`
          : undefined,
        element: cloudflareFound.found ? cloudflareFound.selector : undefined
      };
    } catch (error) {
      logger.debug('Cloudflare check failed', { error });
      return { type: 'cloudflare_challenge', found: false };
    }
  }

  /**
   * Check for suspicious redirects
   */
  private async checkForSuspiciousRedirects(page: Page): Promise<BotDetectionIndicator> {
    try {
      const currentUrl = page.url();

      // Check if URL contains bot detection patterns
      const suspiciousPatterns = [
        '/challenge',
        '/verify',
        '/captcha',
        '/blocked',
        '/security',
        'bot-detection',
        'human-verification'
      ];

      const foundPattern = suspiciousPatterns.find(pattern =>
        currentUrl.toLowerCase().includes(pattern)
      );

      return {
        type: 'suspicious_redirect',
        found: !!foundPattern,
        details: foundPattern ? `Suspicious URL pattern detected: ${foundPattern}` : undefined
      };
    } catch (error) {
      logger.debug('Suspicious redirect check failed', { error });
      return { type: 'suspicious_redirect', found: false };
    }
  }

  /**
   * Check for rate limiting messages
   */
  private async checkForRateLimit(page: Page): Promise<BotDetectionIndicator> {
    try {
      const rateLimitFound = await page.evaluate(() => {
        const rateLimitTexts = [
          'rate limit',
          'too many requests',
          'slow down',
          'try again later',
          'request limit exceeded',
          'temporarily blocked',
          'cooling down period'
        ];

        const bodyText = document.body.textContent?.toLowerCase() || '';

        for (const text of rateLimitTexts) {
          if (bodyText.includes(text)) {
            return { found: true, matchedText: text };
          }
        }

        return { found: false };
      });

      return {
        type: 'rate_limit',
        found: rateLimitFound.found,
        details: rateLimitFound.found
          ? `Rate limiting detected: "${rateLimitFound.matchedText}"`
          : undefined
      };
    } catch (error) {
      logger.debug('Rate limit check failed', { error });
      return { type: 'rate_limit', found: false };
    }
  }

  /**
   * Check for suspicious content patterns
   */
  private async checkForSuspiciousContent(page: Page): Promise<BotDetectionIndicator> {
    try {
      const suspiciousContentFound = await page.evaluate(() => {
        // Check if page content is minimal or suspicious
        const bodyText = document.body.textContent?.trim() || '';
        const wordCount = bodyText.split(/\s+/).length;

        // Very minimal content might indicate a challenge page
        if (wordCount < 50) {
          const suspiciousKeywords = [
            'loading',
            'please wait',
            'redirecting',
            'verifying',
            'checking'
          ];

          const lowerText = bodyText.toLowerCase();
          const foundKeyword = suspiciousKeywords.find(keyword => lowerText.includes(keyword));

          if (foundKeyword) {
            return {
              found: true,
              reason: 'minimal_content_with_keywords',
              keyword: foundKeyword,
              wordCount
            };
          }
        }

        return { found: false, wordCount };
      });

      return {
        type: 'suspicious_content',
        found: suspiciousContentFound.found,
        details: suspiciousContentFound.found
          ? `Suspicious content pattern: ${suspiciousContentFound.reason} (${suspiciousContentFound.keyword}, ${suspiciousContentFound.wordCount} words)`
          : undefined
      };
    } catch (error) {
      logger.debug('Suspicious content check failed', { error });
      return { type: 'suspicious_content', found: false };
    }
  }

  /**
   * Calculate confidence score based on detected indicators
   */
  private calculateConfidence(indicators: BotDetectionIndicator[]): number {
    if (indicators.length === 0) return 0;

    // Weight different types of indicators
    const weights: Record<BotDetectionIndicator['type'], number> = {
      captcha: 0.9,
      cloudflare_challenge: 0.8,
      access_denied: 0.7,
      rate_limit: 0.6,
      suspicious_redirect: 0.5,
      challenge_page: 0.6,
      suspicious_content: 0.3
    };

    const totalWeight = indicators.reduce((sum, indicator) => {
      return sum + (weights[indicator.type] || 0.3);
    }, 0);

    // Normalize to 0-1 scale, but cap at 1.0
    return Math.min(totalWeight, 1.0);
  }

  /**
   * Generate a translation key for warning message
   */
  private generateWarningMessage(indicators: BotDetectionIndicator[]): string {
    if (indicators.length === 0) return '';

    const types = indicators.map(i => i.type);

    if (types.includes('captcha')) {
      return 'botDetection.warnings.captcha';
    }

    if (types.includes('cloudflare_challenge')) {
      return 'botDetection.warnings.cloudflareChallenge';
    }

    if (types.includes('access_denied')) {
      return 'botDetection.warnings.accessDenied';
    }

    if (types.includes('rate_limit')) {
      return 'botDetection.warnings.rateLimit';
    }

    return 'botDetection.warnings.general';
  }
}
