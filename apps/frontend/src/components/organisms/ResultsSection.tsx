import React from 'react';
import { PageAnalysisResult } from '../../../../backend/src/domain/models/analysis/page-analysis';
import { Button, Card, MetricCard, ResourceBreakdownItem, ResourceList } from './../';
import {
  processLargestResources,
  processResourceData,
  roundResourceSize
} from './../../utils/websiteAnalysisResultProcessors';

type ResultsSectionProps = {
  results: PageAnalysisResult;
};

const ResultsSection: React.FC<ResultsSectionProps> = ({ results }) => {
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

  const reloadIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"
        fill="currentColor"
      />
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
    <section className="container pt-24">
      <Card className="p-8 flex flex-col gap-12">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold">
              Carbon Footprint for:{' '}
              <a
                className="text-primary underline hover:cursor-pointer"
                target="_blank"
                href={results.url}
              >
                {results.url}
              </a>
            </h3>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row w-full gap-6">
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

        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-semibold">Resource Type Analysis</h4>
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

        <ResourceList title="Largest Resources" resources={largestResources} />

        <div className="w-full flex justify-center">
          <Button
            className="flex flex-row gap-3 w-full lg:w-1/3 justify-center"
            onClick={() => window.location.reload()}
          >
            <p>Try on another page</p>
            <div>{reloadIcon}</div>
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default ResultsSection;
