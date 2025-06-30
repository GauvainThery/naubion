import React, { useEffect } from 'react';
import AnalysisForm from '../components/organisms/AnalysisFormSection';
import LoadingSection from '../components/organisms/LoadingSection';
import ResultsSection from '../components/organisms/ResultsSection';
import MainLayout from '../components/templates/MainLayout';
import useAnalysis from '../hooks/useAnalysis';
import type { AnalysisFormData } from '../types';
import { CallToActionSection, MethodologySection, FAQSection, ErrorAlert } from './../components';

const PageCarbonFootprint: React.FC = () => {
  const {
    isLoading,
    results,
    error,
    steps,
    progress,
    currentStep,
    estimatedDuration,
    startAnalysis
  } = useAnalysis();

  // Check for URL parameters on mount and create form data
  const getFormDataFromUrlParams = (): AnalysisFormData | null => {
    const urlParams = new URLSearchParams(window.location.search);

    // Support both 'url' and 'websiteUrl' parameters
    const urlParam = urlParams.get('url') || urlParams.get('websiteUrl');

    if (!urlParam) {
      return null;
    }

    // Extract other optional parameters with fallbacks
    const interactionLevel =
      (urlParams.get('interactionLevel') as 'minimal' | 'default' | 'thorough') || 'default';
    const deviceType = (urlParams.get('deviceType') as 'desktop' | 'mobile') || 'desktop';

    return {
      url: urlParam,
      interactionLevel: ['minimal', 'default', 'thorough'].includes(interactionLevel)
        ? interactionLevel
        : 'default',
      deviceType: ['desktop', 'mobile'].includes(deviceType) ? deviceType : 'desktop'
    };
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoAnalyze = urlParams.get('autoAnalyze') === 'true';
    const formDataFromUrl = getFormDataFromUrlParams();

    // Auto-analyze if explicitly requested
    if (formDataFromUrl && autoAnalyze) {
      startAnalysis(formDataFromUrl);
    }
  }, [startAnalysis]);

  return (
    <MainLayout className="flex flex-col gap-32" currentPage="pageCarbonFootprint">
      {/* Error Message */}
      {error && <ErrorAlert message={error} className="pt-24" />}

      {/* Analysis Form */}
      {!results && !isLoading && (
        <AnalysisForm className="pt-12" onSubmit={startAnalysis} isLoading={isLoading} />
      )}

      {/* Loading Section */}
      {isLoading && !error && (
        <LoadingSection
          className="pt-24"
          steps={steps}
          progress={progress}
          currentStep={currentStep}
          estimatedDuration={estimatedDuration}
        />
      )}

      {/* Results Section */}
      {results && <ResultsSection className="pt-24" results={results} />}

      {/* Methodology Section */}
      <MethodologySection className="pt-24" />

      {/* FAQ Section */}
      <FAQSection className="pt-12" />

      <CallToActionSection subtitle="This tool gives you a first insight on the environnemental impact of a web page but it's not naubion. Join our waitlist to be the first to know when naubion is live!" />
    </MainLayout>
  );
};

export default PageCarbonFootprint;
