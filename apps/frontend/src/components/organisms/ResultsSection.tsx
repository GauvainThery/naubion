import React from 'react';
import { PageAnalysisResult } from '../../../../backend/src/domain/models/page-analysis';
import { Button, Card, MetricCard, ResourceBreakdownItem, ResourceList, FactCard } from './../';
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 8L13 6M7.0998 7.0011C7.03435 7.32387 7 7.65792 7 8C7 10.7614 9.23858 13 12 13C14.7614 13 17 10.7614 17 8C17 7.65792 16.9656 7.32387 16.9002 7.0011M7.0998 7.0011C7.56264 4.71831 9.58065 3 12 3C14.4193 3 16.4374 4.71831 16.9002 7.0011M7.0998 7.0011C5.87278 7.00733 5.1837 7.04895 4.63803 7.32698C4.07354 7.6146 3.6146 8.07354 3.32698 8.63803C3 9.27976 3 10.1198 3 11.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V11.8C21 10.1198 21 9.27976 20.673 8.63803C20.3854 8.07354 19.9265 7.6146 19.362 7.32698C18.8163 7.04895 18.1272 7.00733 16.9002 7.0011"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
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

  const serverIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 7H18.01M15 7H15.01M18 17H18.01M15 17H15.01M6 10H18C18.9319 10 19.3978 10 19.7654 9.84776C20.2554 9.64477 20.6448 9.25542 20.8478 8.76537C21 8.39782 21 7.93188 21 7C21 6.06812 21 5.60218 20.8478 5.23463C20.6448 4.74458 20.2554 4.35523 19.7654 4.15224C19.3978 4 18.9319 4 18 4H6C5.06812 4 4.60218 4 4.23463 4.15224C3.74458 4.35523 3.35523 4.74458 3.15224 5.23463C3 5.60218 3 6.06812 3 7C3 7.93188 3 8.39782 3.15224 8.76537C3.35523 9.25542 3.74458 9.64477 4.23463 9.84776C4.60218 10 5.06812 10 6 10ZM6 20H18C18.9319 20 19.3978 20 19.7654 19.8478C20.2554 19.6448 20.6448 19.2554 20.8478 18.7654C21 18.3978 21 17.9319 21 17C21 16.0681 21 15.6022 20.8478 15.2346C20.6448 14.7446 20.2554 14.3552 19.7654 14.1522C19.3978 14 18.9319 14 18 14H6C5.06812 14 4.60218 14 4.23463 14.1522C3.74458 14.3552 3.35523 14.7446 3.15224 15.2346C3 15.6022 3 16.0681 3 17C3 17.9319 3 18.3978 3.15224 18.7654C3.35523 19.2554 3.74458 19.6448 4.23463 19.8478C4.60218 20 5.06812 20 6 20Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
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

        <div className="grid lg:grid-cols-2 grid-cols-1 w-full gap-6">
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
          <FactCard
            title={results.greenHosting.green ? 'Green hosted' : 'Not green hosted'}
            label={
              results.greenHosting.green
                ? `This page is hosted by ${results.greenHosting.data?.hosted_by} using renewable energy`
                : 'This page is not hosted by a green hosting provider'
            }
            icon={serverIcon}
            isPositive={results.greenHosting.green}
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
            onClick={() => {
              window.location.href = window.location.pathname;
            }}
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
