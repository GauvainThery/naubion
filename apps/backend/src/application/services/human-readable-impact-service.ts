/**
 * Human Readable Impact Application Service
 * Converts CO2e emissions into human-readable equivalents
 */

import {
  HumanReadableImpactInput,
  HumanReadableImpactResult
} from '../../domain/models/human-readable-impact.js';
import { HumanReadableImpactDomainService } from '../../domain/services/human-readable-impact-service.js';
import logger from '../../shared/logger.js';

export class HumanReadableImpactService {
  private humanReadableImpactDomainService: HumanReadableImpactDomainService;

  constructor() {
    this.humanReadableImpactDomainService = new HumanReadableImpactDomainService();
  }

  /**
   * Convert CO2e emissions into human-readable impact
   */
  convertToHumanReadableImpact({ gCo2e }: HumanReadableImpactInput): HumanReadableImpactResult {
    const context = this.humanReadableImpactDomainService.createHumanReadableImpactContext(gCo2e);

    const startTime = Date.now();
    logger.info(`Starting human readable impact conversion for ${gCo2e} gCO2e`);

    try {
      // Calculate equivalent kilometers with gasoline car
      const kmWithGasolineCar =
        this.humanReadableImpactDomainService.calculateKmWithGasolineCar(gCo2e);

      // Create comprehensive result
      const result = this.humanReadableImpactDomainService.createHumanReadableImpactResult(
        context,
        kmWithGasolineCar
      );

      const duration = Date.now() - startTime;
      logger.info(
        `Human readable impact conversion completed in ${duration}ms for ${gCo2e} gCO2e`,
        {
          kmWithGasolineCar: result.meterWithGasolineCar
        }
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        `Human readable impact conversion failed after ${duration}ms for ${gCo2e} gCO2e`,
        {
          error: error instanceof Error ? error.message : String(error)
        }
      );
      throw error;
    }
  }
}
