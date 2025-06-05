import React from 'react';
import Card from '../atoms/Card';
import Button from '../atoms/Button';
import MetricCard from '../molecules/MetricCard';
import ResourceBreakdownItem from '../molecules/ResourceBreakdownItem';
import ResourceList from '../molecules/ResourceList';
import { AnalysisResult } from '../../../../backend/src/domain/models/analysis';
import {
  processLargestResources,
  processResourceData,
  roundResourceSize
} from './../../utils/websiteAnalysisResultProcessors.ts';

type ResultsSectionProps = {
  results: AnalysisResult;
  onShare: () => void;
};

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, onShare }) => {
  if (!results) {
    return null;
  }

  const largestResources = processLargestResources(results.resources.resources);

  const totalSizeIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
        fill="currentColor"
      />
    </svg>
  );

  const resourceCountIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
        fill="currentColor"
      />
      <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z" fill="currentColor" />
    </svg>
  );

  const resourceTypes = [
    { type: 'html', label: 'HTML Documents', color: 'html' as const, indicator: 'bg-blue-500' },
    { type: 'css', label: 'Stylesheets', color: 'css' as const, indicator: 'bg-purple-500' },
    { type: 'js', label: 'JavaScript', color: 'js' as const, indicator: 'bg-yellow-500' },
    { type: 'media', label: 'Images & Media', color: 'media' as const, indicator: 'bg-green-500' },
    { type: 'font', label: 'Web Fonts', color: 'font' as const, indicator: 'bg-pink-500' },
    { type: 'other', label: 'Other Resources', color: 'other' as const, indicator: 'bg-gray-500' }
  ];

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Page Weight Analysis Results</h3>
            <div className="text-gray-600 break-all">{results.url}</div>
          </div>
          <Button variant="outline" onClick={onShare} className="flex-shrink-0">
            📋 Copy Share Link
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard
            icon={totalSizeIcon}
            value={roundResourceSize(results.resources.totalTransferSize)}
            label="Total Page Weight"
            isPrimary
          />
          <MetricCard
            icon={resourceCountIcon}
            value={results.resources.resourceCount}
            label="Total Resources"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Resource Type Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourceTypes.map(resource => {
              const data = processResourceData(
                results.resources.resources,
                results.resources.totalTransferSize,
                resource.type
              );

              return (
                <ResourceBreakdownItem
                  key={resource.type}
                  type={resource.type}
                  label={resource.label}
                  size={data.size}
                  count={`${data.count}`}
                  percentage={data.percentage}
                  average={typeof data.average === 'number' ? `${data.average} KB` : data.average}
                  color={resource.color}
                  indicator={resource.indicator}
                />
              );
            })}
          </div>
        </div>

        <ResourceList title="Largest Resources" resources={largestResources} className="mt-8" />
      </Card>
    </div>
  );
};

export default ResultsSection;
