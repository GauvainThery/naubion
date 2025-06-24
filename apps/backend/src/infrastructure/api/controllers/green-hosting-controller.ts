/**
 * API controller for green hosting assessment
 */

import { Request, Response } from 'express';
import { GreenHostingService } from '../../../application/services/green-hosting-service.js';
import { GreenHostingResult } from '../../../domain/models/green-hosting.js';
import { asyncHandler, validateUrl } from '../../../shared/errors.js';
import logger from '../../../shared/logger.js';

export class GreenHostingController {
  constructor(private greenHostingService: GreenHostingService) {}

  /**
   * Perform green hosting assessment for a given URL
   */
  assessGreenHosting = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { url } = req.params;

    // Validate URL format
    validateUrl(url);

    logger.info(`Starting green hosting assessment for ${url}`);

    try {
      // Perform assessment
      const result: GreenHostingResult = await this.greenHostingService.assessGreenHosting(url);

      logger.info(`Green hosting assessment completed for ${url}`, {
        green: result.green,
        duration: result.duration
      });

      res.status(200).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Green hosting assessment failed for ${url}`, { error });
      res.status(500).json({
        error: 'Green hosting assessment failed',
        message: errorMessage,
        url
      });
    }
  });
}
