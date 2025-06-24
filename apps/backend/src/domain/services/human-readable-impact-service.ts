/**
 * Human Readable Impact Domain Service
 */

import {
  HumanReadableImpactInput,
  HumanReadableImpactResult
} from '../models/human-readable-impact.js';

export interface HumanReadableImpactContext {
  input: HumanReadableImpactInput;
  startTime: Date;
}

export class HumanReadableImpactDomainService {
  /**
   * Create human readable impact context with validated options
   */
  createHumanReadableImpactContext(gCo2e: number): HumanReadableImpactContext {
    // Validate input
    if (typeof gCo2e !== 'number' || gCo2e < 0) {
      throw new Error(`Invalid gCO2e value provided: ${gCo2e}`);
    }

    return {
      input: {
        gCo2e
      },
      startTime: new Date()
    };
  }

  /**
   * Create human readable impact result
   */
  createHumanReadableImpactResult(
    context: HumanReadableImpactContext,
    kmWithGasolineCar: number
  ): HumanReadableImpactResult {
    return {
      kmWithGasolineCar
    };
  }

  /**
   * Calculate equivalent kilometers with gasoline car
   * Pour une voiture à essence, qui émet 200 gCO2e/km, 1 g de CO2e correspond à environ 5 mètres parcourus.
   */
  calculateKmWithGasolineCar(gCo2e: number): number {
    // 1 g CO2e = 5 meters = 0.005 km
    const metersPerGramCo2e = 5;
    const kmPerGramCo2e = metersPerGramCo2e / 1000;

    return gCo2e * kmPerGramCo2e;
  }
}
