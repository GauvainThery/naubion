import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  ResourceList,
  Divider,
  ResultsHeader,
  ResultsSummary,
  EnvironmentalImpactSection,
  KeyFactsSection,
  ResourceAnalysisSection,
  TryAnotherPageSection
} from './../';
import BotDetectionWarning from '../molecules/BotDetectionWarning';
import {
  processLargestResources,
  roundResourceSize,
  formatCo2eEmissions,
  formatDistance
} from './../../utils/websiteAnalysisResultProcessors';
import { cn } from './../../utils/classnames';
import { scrollTopPage } from './../../utils/scrollTopPage';
import { PageAnalysisResult } from '@naubion/shared';

type ResultsSectionProps = {
  results: PageAnalysisResult;
  className?: string;
};

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, className }) => {
  const { t } = useTranslation('analysis');
  // State for visits multiplier (continuous range)
  const [visitsCount, setVisitsCount] = React.useState(3000); // Default to 3000 visits per month

  useEffect(() => {
    // Scroll to top when results are loaded
    scrollTopPage();
  }, []);

  const multiplier = visitsCount;

  // Calculate scaled values and format them
  const scaledCo2e = results.gCo2e * multiplier;
  const scaledDistance = results.humanReadableImpact.meterWithGasolineCar * multiplier;

  // Format with appropriate units
  const formattedCo2e = formatCo2eEmissions(scaledCo2e);
  const formattedDistance = formatDistance(scaledDistance);

  if (!results) {
    return null;
  }

  const largestResources = processLargestResources(results.resources.resources);

  const resourceTypes = [
    {
      type: 'html',
      label: t('results.resourceTypes.html'),
      color: 'html' as const,
      indicator: 'bg-blue-500'
    },
    {
      type: 'css',
      label: t('results.resourceTypes.css'),
      color: 'css' as const,
      indicator: 'bg-purple-500'
    },
    {
      type: 'js',
      label: t('results.resourceTypes.js'),
      color: 'js' as const,
      indicator: 'bg-yellow-500'
    },
    {
      type: 'media',
      label: t('results.resourceTypes.media'),
      color: 'media' as const,
      indicator: 'bg-green-500'
    },
    {
      type: 'font',
      label: t('results.resourceTypes.font'),
      color: 'font' as const,
      indicator: 'bg-pink-500'
    },
    {
      type: 'other',
      label: t('results.resourceTypes.other'),
      color: 'other' as const,
      indicator: 'bg-gray-500'
    }
  ];

  return (
    <section className={cn('container', className)}>
      <Card className="p-12 flex flex-col gap-12">
        {/* Header */}
        <ResultsHeader
          url={results.url}
          deviceType={results.options.deviceType}
          interactionLevel={results.options.interactionLevel}
          analysisDate={results.timestamp}
        />

        {/* Bot Detection Warning */}
        {results.botDetection?.detected && (
          <BotDetectionWarning botDetection={results.botDetection} />
        )}

        {/* Summary */}
        <ResultsSummary
          url={results.url}
          isGreenHosted={results.greenHosting.green}
          totalWeight={roundResourceSize(results.resources.totalTransferSize)}
          visitsCount={visitsCount}
          carbonEmission={formattedCo2e}
          carEquivalent={formattedDistance}
        />

        <Divider />

        {/* Environmental Impact */}
        <EnvironmentalImpactSection
          visitsCount={visitsCount}
          onVisitsChange={setVisitsCount}
          carbonEmission={formattedCo2e}
          carEquivalent={formattedDistance}
        />

        <Divider />

        {/* Key Facts */}
        <KeyFactsSection
          totalWeight={roundResourceSize(results.resources.totalTransferSize)}
          resourceCount={results.resources.resourceCount}
          greenHosting={results.greenHosting}
        />

        <Divider />

        {/* Resource Analysis */}
        <ResourceAnalysisSection
          resources={results.resources.resources}
          totalTransferSize={results.resources.totalTransferSize}
          resourceTypes={resourceTypes}
        />

        <Divider />

        <ResourceList resources={largestResources} />

        <TryAnotherPageSection />
      </Card>
    </section>
  );
};

export default ResultsSection;
