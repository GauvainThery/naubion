/**
 * API controller for website analysis
 */

import { Request, Response } from 'express';
import { WebsiteAnalysisService } from '../../../application/services/website-analysis-service.js';
import { asyncHandler, validateUrl, validateAnalysisOptions } from '../../../shared/errors.js';
import logger from '../../../shared/logger.js';

type AnalysisRequestBody = {
  url: string;
  interactionLevel?: 'minimal' | 'default' | 'thorough';
  deviceType?: 'desktop' | 'mobile';
};

export class AnalysisController {
  constructor(private analysisService: WebsiteAnalysisService) {}

  /**
   * Analyze a website
   */
  analyze = asyncHandler(async (req: Request<{}, any, AnalysisRequestBody>, res: Response) => {
    const { url, interactionLevel = 'default', deviceType = 'desktop' } = req.body;

    // Validate inputs
    validateUrl(url);
    validateAnalysisOptions({ interactionLevel, deviceType });

    logger.info('Starting analysis', {
      url,
      interactionLevel,
      deviceType,
      userAgent: req.get('User-Agent')
    });

    let result;

    // Single page analysis
    result = await this.analysisService.analyzeUrl(url, {
      interactionLevel,
      deviceType
    });

    logger.info('Analysis completed', {
      url
    });

    res.json(result);
  });

  /**
   * Health check endpoint
   */
  healthCheck = (req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      service: 'green-web-compass-api',
      timestamp: new Date().toISOString()
    });
  };
}
