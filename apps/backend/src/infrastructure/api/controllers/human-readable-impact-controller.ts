/**
 * API controller for human readable impact conversion
 */

import { Request, Response } from 'express';
import { HumanReadableImpactResult } from '../../../domain/models/human-readable-impact.js';
import { asyncHandler } from '../../../shared/errors.js';
import logger from '../../../shared/logger.js';
import { HumanReadableImpactService } from '../../../application/services/human-readable-impact-service.js';

export class HumanReadableImpactController {
  constructor(private humanReadableImpactService: HumanReadableImpactService) {}

  /**
   * Convert CO2e emissions into human-readable impact (gasoline car kilometers)
   */
  convertToHumanReadableImpact = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { gCo2e } = req.params;

      logger.info(`Starting human readable impact conversion for ${gCo2e} gCO2e`);

      try {
        // Perform conversion
        const result: HumanReadableImpactResult =
          this.humanReadableImpactService.convertToHumanReadableImpact({
            gCo2e: parseFloat(gCo2e)
          });

        logger.info(`Human readable impact conversion completed for ${gCo2e} gCO2e`, {
          kmWithGasolineCar: result.meterWithGasolineCar
        });

        res.status(200).json(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Human readable impact conversion failed for ${gCo2e} gCO2e`, { error });
        res.status(500).json({
          error: 'Human readable impact conversion failed',
          message: errorMessage,
          gCo2e: parseFloat(gCo2e)
        });
      }
    }
  );
}
