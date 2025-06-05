import { useState, useCallback } from 'react';
import type { AnalysisFormData, LoadingStep } from '../types';
import { AnalysisResult } from '../../../backend/src/domain/models/analysis';

const useAnalysis = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFormData, setLastFormData] = useState<AnalysisFormData | null>(null);

  const steps: LoadingStep[] = [
    {
      id: 'step1',
      title: 'Loading Page',
      description: 'Navigating to the website and waiting for initial load'
    },
    {
      id: 'step2',
      title: 'Simulating User Behavior',
      description: 'Scrolling, clicking buttons, and interacting with the page'
    },
    {
      id: 'step3',
      title: 'Monitoring Network Activity',
      description: 'Tracking resources loaded after interactions'
    },
    {
      id: 'step4',
      title: 'Analyzing Resources',
      description: 'Processing and categorizing all loaded resources'
    }
  ];

  const startAnalysis = useCallback(async (formData: AnalysisFormData) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setLastFormData(formData); // Store the form data for sharing

    try {
      // Start the analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: unknown = await response.json();

      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(data.error as string);
      }

      setResults(data as AnalysisResult);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  const shareResults = useCallback(() => {
    if (results && lastFormData) {
      const params = new URLSearchParams({
        websiteUrl: lastFormData.url,
        averagePages: lastFormData.averagePages.toString(),
        interactionLevel: lastFormData.interactionLevel,
        deviceType: lastFormData.deviceType,
        autoAnalyze: 'true' // This tells the app to auto-analyze when the link is opened
      });

      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('Share link copied to clipboard');
      });
    }
  }, [results, lastFormData]);

  return {
    isLoading,
    results,
    error,
    steps,
    startAnalysis,
    shareResults
  };
};

export default useAnalysis;
