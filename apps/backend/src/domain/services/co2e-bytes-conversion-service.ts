/**
 * CO2e Bytes Conversion Domain Service
 */

import {
  Co2eBytesConversionInput,
  Co2eBytesConversionResult
} from '../models/co2e-bytes-conversion.js';

export interface Co2eBytesConversionContext {
  input: Co2eBytesConversionInput;
  startTime: Date;
}

export class Co2eBytesConversionDomainService {
  /**
   * Create CO2e bytes conversion context with validated options
   */
  createCo2eBytesConversionContext(
    bytes: number,
    isGreenHosted: boolean
  ): Co2eBytesConversionContext {
    // Validate URL
    if (typeof bytes !== 'number' || bytes < 0) {
      throw new Error(`Invalid bytes value provided: ${bytes}`);
    }

    return {
      input: {
        bytes,
        isGreenHosted
      },
      startTime: new Date()
    };
  }

  /**
   * Create CO2e bytes conversion result
   */
  createCo2eBytesConversionResult(
    context: Co2eBytesConversionContext,
    co2eValue: number
  ): Co2eBytesConversionResult {
    const endTime = new Date();
    const duration = endTime.getTime() - context.startTime.getTime();

    return {
      duration,
      unit: 'g', // default unit
      value: co2eValue
    };
  }
}
