import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceBreakdownItem } from '../';
import { processResourceData } from '../../utils/websiteAnalysisResultProcessors';
import { Resource } from '@naubion/shared';

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
  const { t } = useTranslation('analysis');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-center lg:text-left">
          {t('results.sections.resourceAnalysis.title')}
        </h4>
        <p className="text-text-secondary lg:w-7/8">
          {t('results.sections.resourceAnalysis.description')}
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
