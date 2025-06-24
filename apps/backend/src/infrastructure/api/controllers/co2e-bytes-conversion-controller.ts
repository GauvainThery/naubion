/**
 * API controller for green hosting assessment
 */

import { Request, Response } from 'express';
import { Co2eBytesConversionResult } from '../../../domain/models/co2e-bytes-conversion.js';
import { asyncHandler } from '../../../shared/errors.js';
import logger from '../../../shared/logger.js';
import { Co2eBytesConversionService } from '../../../application/services/co2e-bytes-conversion-service.js';

export class Co2eBytesConversionController {
  constructor(private co2eBytesConversionService: Co2eBytesConversionService) {}

  /**
   * Convert bytes into CO2e emissions for a given URL
   */
  convertBytesIntoCo2e = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { bytes, isGreenHosted } = req.params;

    logger.info(`Starting CO2e conversion for ${bytes} bytes with green hosting: ${isGreenHosted}`);

    try {
      // Perform assessment
      const result: Co2eBytesConversionResult =
        this.co2eBytesConversionService.convertBytesIntoCo2e({
          bytes: parseInt(bytes, 10),
          isGreenHosted: isGreenHosted === 'true' // Convert string to boolean
        });

      logger.info(`CO2e conversion completed for ${bytes} bytes`, {
        value: result.value,
        duration: result.duration
      });

      res.status(200).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`CO2e conversion failed for ${bytes} bytes`, { error });
      res.status(500).json({
        error: 'CO2e conversion failed',
        message: errorMessage,
        bytes,
        isGreenHosted: isGreenHosted === 'true'
      });
    }
  });
}
