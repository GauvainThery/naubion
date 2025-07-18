import { AnalysisInitResponse, PageAnalysisResult } from '@naubion/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalysisFormData, LoadingStep } from '../types';

const useAnalysis = () => {
  const { t } = useTranslation('analysis');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<PageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const steps: LoadingStep[] = [
    {
      id: 'step1',
      title: t('loading.steps.step1.title'),
      description: t('loading.steps.step1.description')
    },
    {
      id: 'step2',
      title: t('loading.steps.step2.title'),
      description: t('loading.steps.step2.description')
    },
    {
      id: 'step3',
      title: t('loading.steps.step3.title'),
      description: t('loading.steps.step3.description')
    },
    {
      id: 'step4',
      title: t('loading.steps.step4.title'),
      description: t('loading.steps.step4.description')
    },
    {
      id: 'step5',
      title: t('loading.steps.step5.title'),
      description: t('loading.steps.step5.description')
    },
    {
      id: 'step6',
      title: t('loading.steps.step6.title'),
      description: t('loading.steps.step6.description')
    },
    {
      id: 'step7',
      title: t('loading.steps.step7.title'),
      description: t('loading.steps.step7.description')
    },
    {
      id: 'step8',
      title: t('loading.steps.step8.title'),
      description: t('loading.steps.step8.description')
    },
    {
      id: 'step9',
      title: t('loading.steps.step9.title'),
      description: t('loading.steps.step9.description')
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

      if (response.status === 500) {
        // Handle server error with error message
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Analysis failed on the server';
        setError(errorMessage);
        setIsLoading(false);
        setProgress(0);
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
      // Clean up any existing EventSource connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setIsLoading(true);
      setError(null);
      setResults(null);
      setProgress(0);
      setCurrentStep('');
      setCurrentMessage('');

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
          // Try to get error message from response body
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
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
          setCurrentMessage(progressData.message || '');

          // Handle error state
          if (progressData.step === 'error' || progressData.status === 'failed') {
            eventSource.close();
            const errorMessage = progressData.message || 'Analysis failed';
            setError(errorMessage);
            setIsLoading(false);
            setProgress(0);
            return;
          }

          // If analysis is complete, fetch final results
          if (progressData.progress >= 100 || progressData.step === 'complete') {
            eventSource.close();
            fetchFinalResults(initData.analysisId);
          }
        };

        eventSource.onerror = error => {
          console.error('SSE Error:', error);
          eventSource.close();
          setError('Connection lost. Please try again.');
          setIsLoading(false);
          setProgress(0);
          // Don't try fetchFinalResults on connection error as it might be a network issue
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

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return {
    isLoading,
    results,
    error,
    steps,
    progress,
    currentStep,
    currentMessage,
    estimatedDuration,
    startAnalysis
  };
};

export default useAnalysis;
