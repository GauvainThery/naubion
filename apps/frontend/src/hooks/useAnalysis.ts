import { useState, useCallback, useRef } from 'react';
import type {
  AnalysisFormData,
  WebsiteAnalysisFormData,
  AnalysisType,
  LoadingStep
} from '../types';
import { PageAnalysisResult } from '../../../backend/src/domain/models/analysis/page-analysis';

type AnalysisInitResponse = {
  analysisId: string;
  estimatedDuration: number;
  status: 'started';
  message: string;
};

const useAnalysis = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<PageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFormData, setLastFormData] = useState<
    AnalysisFormData | WebsiteAnalysisFormData | null
  >(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('page');
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const steps: LoadingStep[] = [
    {
      id: 'step1',
      title: 'Setup',
      description: 'Setting up browser environment'
    },
    {
      id: 'step2',
      title: 'Navigation',
      description: 'Navigating to target website'
    },
    {
      id: 'step3',
      title: 'Simulation',
      description: 'Simulating user interactions'
    },
    {
      id: 'step4',
      title: 'Processing',
      description: 'Processing and categorizing resources'
    }
  ];

  const fetchFinalResults = useCallback(async (analysisId: string) => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}/result`);

      if (response.status === 202) {
        // Still running, wait a bit and try again
        setTimeout(() => fetchFinalResults(analysisId), 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data as PageAnalysisResult);
      setProgress(100);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch results';
      setError(errorMessage);
      setIsLoading(false);
      setProgress(0);
    }
  }, []);

  const startAnalysis = useCallback(
    async (formData: AnalysisFormData) => {
      setIsLoading(true);
      setError(null);
      setResults(null);
      setProgress(0);
      setCurrentStep('');
      setLastFormData(formData);
      setAnalysisType('page');

      try {
        // Phase 1: Start analysis and get immediate response
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

        const initData = (await response.json()) as AnalysisInitResponse;
        setEstimatedDuration(initData.estimatedDuration);

        // Phase 2: Set up Server-Sent Events for progress updates
        const eventSource = new EventSource(`/api/analysis/${initData.analysisId}/progress`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = event => {
          const progressData = JSON.parse(event.data);
          setProgress(progressData.progress);
          setCurrentStep(progressData.step);

          // If analysis is complete, fetch final results
          if (progressData.progress >= 100 || progressData.step === 'complete') {
            eventSource.close();
            fetchFinalResults(initData.analysisId);
          }
        };

        eventSource.onerror = error => {
          console.error('SSE Error:', error);
          eventSource.close();
          // Fallback: try to fetch results anyway
          fetchFinalResults(initData.analysisId);
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred during analysis';
        setError(errorMessage);
        setIsLoading(false);
        setProgress(0);
      }
    },
    [fetchFinalResults]
  );

  const startWebsiteAnalysis = useCallback(
    async (formData: WebsiteAnalysisFormData) => {
      setIsLoading(true);
      setError(null);
      setResults(null);
      setProgress(0);
      setCurrentStep('');
      setLastFormData(formData);
      setAnalysisType('website');

      try {
        // Phase 1: Start website analysis and get immediate response
        const response = await fetch('/api/analyze-website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const initData = (await response.json()) as AnalysisInitResponse;
        setEstimatedDuration(initData.estimatedDuration);

        // Phase 2: Set up Server-Sent Events for progress updates
        const eventSource = new EventSource(`/api/analysis/${initData.analysisId}/progress`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = event => {
          const progressData = JSON.parse(event.data);
          setProgress(progressData.progress);
          setCurrentStep(progressData.step);

          // If analysis is complete, fetch final results
          if (progressData.progress >= 100 || progressData.step === 'complete') {
            eventSource.close();
            fetchFinalResults(initData.analysisId);
          }
        };

        eventSource.onerror = error => {
          console.error('SSE Error:', error);
          eventSource.close();
          // Fallback: try to fetch results anyway
          fetchFinalResults(initData.analysisId);
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred during website analysis';
        setError(errorMessage);
        setIsLoading(false);
        setProgress(0);
      }
    },
    [fetchFinalResults]
  );

  const shareResults = useCallback(() => {
    if (results && lastFormData && analysisType === 'page') {
      const pageData = lastFormData as AnalysisFormData;
      const params = new URLSearchParams({
        websiteUrl: pageData.url,
        averagePages: pageData.averagePages.toString(),
        interactionLevel: pageData.interactionLevel,
        deviceType: pageData.deviceType,
        autoAnalyze: 'true' // This tells the app to auto-analyze when the link is opened
      });

      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('Share link copied to clipboard');
      });
    } else if (results && lastFormData && analysisType === 'website') {
      const websiteData = lastFormData as WebsiteAnalysisFormData;
      const params = new URLSearchParams({
        websiteUrl: websiteData.url,
        desktopMobileRatio: websiteData.desktopMobileRatio.toString(),
        interactionLevel: websiteData.interactionLevel,
        monthlyVisits: websiteData.monthlyVisits.toString(),
        analysisType: 'website',
        autoAnalyze: 'true'
      });

      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('Share link copied to clipboard');
      });
    }
  }, [results, lastFormData, analysisType]);

  return {
    isLoading,
    results,
    error,
    steps,
    progress,
    currentStep,
    estimatedDuration,
    analysisType,
    startAnalysis,
    startWebsiteAnalysis,
    shareResults
  };
};

export default useAnalysis;
