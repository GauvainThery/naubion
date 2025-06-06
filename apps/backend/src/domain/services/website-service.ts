/**
 * Website domain service - Core business logic for analyzing websites
 */

import { Website, Page } from '../models/website.js';
import logger from '../../shared/logger.js';

export class WebsiteService {
  /**
   * Analyze a website by aggregating page metrics
   */
  aggregateWebsiteMetrics(pages: Page[]): Website {
    if (pages.length === 0) {
      throw new Error('Cannot aggregate website metrics with no pages');
    }

    // Extract domain from first page URL
    const domain = this.extractDomain(pages[0].url);

    // Calculate aggregated metrics
    const totalResourceSize = pages.reduce(
      (sum, page) => sum + page.resources.totalTransferSize,
      0
    );

    const avgResourcesPerPage =
      pages.reduce((sum, page) => sum + page.resources.resourceCount, 0) / pages.length;

    // Create a comprehensive website object
    const website: Website = {
      domain,
      pages,
      avgResourcesPerPage,
      totalResourceSize,
      totalPages: pages.length
    };

    logger.debug('Website metrics aggregated', {
      domain,
      pageCount: pages.length
    });

    return website;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      logger.warn(`Failed to extract domain from URL: ${url}`, { error });
      return url;
    }
  }
}
