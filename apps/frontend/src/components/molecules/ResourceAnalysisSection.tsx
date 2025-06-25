import React from 'react';
import { ResourceBreakdownItem } from '../';
import { processResourceData } from '../../utils/websiteAnalysisResultProcessors';
import { Resource } from '../../../../backend/src/domain/models/resource';

type ResourceType = {
  type: string;
  label: string;
  color: 'html' | 'css' | 'js' | 'media' | 'font' | 'other';
  indicator: string;
};

type ResourceAnalysisSectionProps = {
  resources: Resource[];
  totalTransferSize: number;
  resourceTypes: ResourceType[];
};

const ResourceAnalysisSection: React.FC<ResourceAnalysisSectionProps> = ({
  resources,
  totalTransferSize,
  resourceTypes
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-center lg:text-left">Resource Type Analysis</h4>
        <p className="text-text-secondary lg:w-7/8">
          A breakdown of the resources loaded by the page, categorized by type. This analysis helps
          identify which types of resources contribute most to the page's total transfer size and
          can guide optimization efforts.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resourceTypes.map(resource => {
          const data = processResourceData(resources, totalTransferSize, resource.type);

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
  );
};

export default ResourceAnalysisSection;
