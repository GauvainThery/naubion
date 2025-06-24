export interface Co2eBytesConversionInput {
  bytes: number;
  isGreenHosted?: boolean;
}

export interface Co2eBytesConversionResult {
  value: number;
  unit: 'g' | 'kg' | 't';
  duration: number;
}
