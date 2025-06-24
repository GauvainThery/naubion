import { PageAnalysisResult } from '../../../backend/src/domain/models/page-analysis';

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

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AnalysisApiResponse = ApiResponse<PageAnalysisResult> | PageAnalysisResult;
