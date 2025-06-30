import { PageAnalysisResult, ApiResponse } from '@naubion/shared';

// Frontend-specific types
export type AnalysisFormData = {
  url: string;
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

export type AnalysisApiResponse = ApiResponse<PageAnalysisResult> | PageAnalysisResult;
