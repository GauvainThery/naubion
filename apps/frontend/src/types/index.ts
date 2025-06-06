import { AnalysisResult } from './../../../backend/src/domain/models/analysis';

// Frontend-specific types
export type AnalysisFormData = {
  url: string;
  averagePages: number;
  interactionLevel: 'minimal' | 'default' | 'thorough';
  deviceType: 'desktop' | 'mobile';
};

export type WebsiteAnalysisFormData = {
  url: string;
  desktopMobileRatio: number; // 0-100, percentage of desktop users
  interactionLevel: 'minimal' | 'default' | 'thorough';
  monthlyVisits: number;
};

export type AnalysisType = 'page' | 'website';

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

export type AnalysisApiResponse = ApiResponse<AnalysisResult> | AnalysisResult;
