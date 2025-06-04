// Re-export shared types
export * from '@green-web-compass/shared';

// Frontend-specific types
export type AnalysisFormData = {
  url: string;
  averagePages: number;
  interactionLevel: 'minimal' | 'default' | 'thorough';
  deviceType: 'desktop' | 'mobile';
};

export type LoadingStep = {
  id: string;
  title: string;
  description: string;
};

export type ResourceInfo = {
  url: string;
  type: string;
  size: number;
  category: string;
};

export type LargestResource = {
  name: string;
  type: string;
  size: string;
};

export type AnalysisResults = {
  url: string;
  analyzedUrl?: string;
  timestamp: string;
  totalSize: number;
  resourceCount: number;
  co2Emissions: number;
  energyConsumption: number;
  resources: ResourceInfo[];
  largestResources?: LargestResource[];
  breakdown: {
    [key: string]: {
      size: number;
      count: number;
      percentage: number;
      average?: number;
    };
  };
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AnalysisApiResponse = ApiResponse<AnalysisResults> | AnalysisResults;
