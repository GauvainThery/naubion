import React, { useEffect } from 'react';
import MainLayout from './components/templates/MainLayout';
import AnalysisForm from './components/organisms/AnalysisForm';
import LoadingSection from './components/organisms/LoadingSection';
import ResultsSection from './components/organisms/ResultsSection';
import useAnalysis from './hooks/useAnalysis';

const App: React.FC = () => {
  const { isLoading, results, error, steps, startAnalysis, shareResults } = useAnalysis();

  // Check for URL parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlParam = urlParams.get('url');

    if (urlParam) {
      startAnalysis({
        url: urlParam,
        averagePages: 5,
        interactionLevel: 'default',
        deviceType: 'desktop'
      });
    }
  }, [startAnalysis]);

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Analysis Form */}
        <section>
          <AnalysisForm onSubmit={startAnalysis} isLoading={isLoading} />
        </section>

        {/* Loading Section */}
        {isLoading && (
          <section>
            <LoadingSection steps={steps} />
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
      </div>
    </MainLayout>
  );
};

export default App;
