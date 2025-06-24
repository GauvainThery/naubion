import {
  Co2eBytesConversionInput,
  Co2eBytesConversionResult
} from '../../domain/models/co2e-bytes-conversion.js';
import { Co2eBytesConversionDomainService } from '../../domain/services/co2e-bytes-conversion-service.js';
import { Co2JSAPIClient } from '../../infrastructure/externalApi/co2js-api.js';
import { AnalysisError } from '../../shared/errors.js';
import logger from '../../shared/logger.js';

export class Co2eBytesConversionService {
  private co2JSAPIClient: Co2JSAPIClient;
  private co2eBytesConversionDomainService: Co2eBytesConversionDomainService;

  constructor() {
    this.co2JSAPIClient = new Co2JSAPIClient();
    this.co2eBytesConversionDomainService = new Co2eBytesConversionDomainService();
  }

  /**
   * Convert bytes into CO2e emissions
   */
  convertBytesIntoCo2e({
    bytes,
    isGreenHosted = false // default to false
  }: Co2eBytesConversionInput): Co2eBytesConversionResult {
    const context = this.co2eBytesConversionDomainService.createCo2eBytesConversionContext(
      bytes,
      isGreenHosted
    );

    const startTime = Date.now();
    logger.info(`Starting CO2e conversion for ${bytes} bytes`);

    try {
      const co2JSResults = this.co2JSAPIClient.convertBytesIntoCo2e(
        context.input.bytes,
        context.input.isGreenHosted
      );

      // Create comprehensive result
      const result = this.co2eBytesConversionDomainService.createCo2eBytesConversionResult(
        context,
        co2JSResults
      );

      const duration = Date.now() - startTime;
      logger.info(`CO2e conversion completed in ${duration}ms for ${bytes} bytes`, {
        value: result.value
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`CO2e conversion failed for ${bytes} bytes`, { error: errorMessage });
      throw new AnalysisError(
        `Failed to convert bytes into CO2e emissions: ${errorMessage}`,
        `bytes: ${bytes}`
      );
    }
  }
}
