import { co2 } from '@tgwf/co2';

export class Co2JSAPIClient {
  private readonly client;

  constructor() {
    this.client = new co2({ model: 'swd', version: 4 });
  }
  /**
   * Convert bytes into CO2e emissions using the Green Web Foundation API
   */
  convertBytesIntoCo2e(bytes: number, isGreenHosted = false): number {
    try {
      const result = this.client.perByte(bytes, isGreenHosted);
      return result as number; // Number because using perByte and not perByteTrace
    } catch (error) {
      throw new Error(
        `Failed to convert bytes into CO2e: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
