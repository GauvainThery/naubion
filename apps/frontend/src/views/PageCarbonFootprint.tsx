import React, { useEffect } from 'react';
import AnalysisForm from '../components/organisms/AnalysisForm';
import LoadingSection from '../components/organisms/LoadingSection';
import ResultsSection from '../components/organisms/ResultsSection';
import MainLayout from '../components/templates/MainLayout';
import useAnalysis from '../hooks/useAnalysis';
import type { AnalysisFormData } from '../types';
import { CallToActionSection } from './../components';

const PageCarbonFootprint: React.FC = () => {
  const {
    isLoading,
    results,
    error,
    steps,
    progress,
    currentStep,
    estimatedDuration,
    startAnalysis,
    shareResults
  } = useAnalysis();

  // Check for URL parameters on mount and create form data
  const getFormDataFromUrlParams = (): AnalysisFormData | null => {
    const urlParams = new URLSearchParams(window.location.search);

    // Support both 'url' and 'websiteUrl' parameters
    const urlParam = urlParams.get('url') || urlParams.get('websiteUrl');

    if (!urlParam) return null;

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

    // Auto-analyze if explicitly requested, or if using legacy 'url' parameter for backwards compatibility
    if (formDataFromUrl && autoAnalyze) {
      startAnalysis(formDataFromUrl);
    }
  }, [startAnalysis]);

  return (
    <MainLayout currentPage="pageCarbonFootprint">
      <div className="lg:pt-18 p-8">
        {/* Analysis Form */}
        {!results && !isLoading && (
          <section>
            <AnalysisForm onSubmit={startAnalysis} isLoading={isLoading} />
          </section>
        )}

        {/* Loading Section */}
        {isLoading && (
          <section>
            <LoadingSection
              steps={steps}
              progress={progress}
              currentStep={currentStep}
              estimatedDuration={estimatedDuration}
            />
          </section>
        )}

        {/* Error Message */}
        {error && (
          <section>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Results Section */}
        {results && (
          <section>
            <ResultsSection results={results} onShare={shareResults} />
          </section>
        )}

        <CallToActionSection
          className="pt-36 pb-8"
          subtitle="This tool gives you a first insight on the environnemental impact of a web page but it’s not naubion. Join our waitlist to be the first to know when naubion is live!"
        />
      </div>
    </MainLayout>
  );
};

export default PageCarbonFootprint;
