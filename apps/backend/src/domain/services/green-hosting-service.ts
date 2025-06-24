/**
 * Green Hosting Domain Service
 */

import { GreenHostingData, GreenHostingResult } from '../models/green-hosting.js';
import { isValidUrl, normalizeUrl } from './page-analysis-service.js';

export interface GreenHostingContext {
  url: string;
  startTime: Date;
}

export class GreenHostingDomainService {
  /**
   * Create green hosting context with validated options
   */
  createGreenHostingContext(url: string): GreenHostingContext {
    // Validate URL
    if (!isValidUrl(url)) {
      throw new Error(`Invalid URL provided: ${url}`);
    }

    return {
      url: normalizeUrl(url),
      startTime: new Date()
    };
  }

  /**
   * Create green hosting result
   */
  createGreenHostingResult(
    context: GreenHostingContext,
    green: boolean,
    data?: GreenHostingData
  ): GreenHostingResult {
    const endTime = new Date();
    const duration = endTime.getTime() - context.startTime.getTime();

    return {
      duration,
      url: context.url,
      green,
      data
    };
  }

  /**
   * Validate green hosting assessment prerequisites
   */
  validateGreenHostingAssessmentPrerequisites(context: GreenHostingContext): void {
    // Check URL accessibility
    if (!isValidUrl(context.url)) {
      throw new Error('Invalid URL format');
    }
  }
}
