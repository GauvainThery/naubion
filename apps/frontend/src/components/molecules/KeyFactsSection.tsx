import React from 'react';
import { MetricCard, FactCard, TotalSizeIcon, ResourceCountIcon, ServerIcon } from '../';
import { GreenHostingResult } from '@naubion/shared';

type KeyFactsSectionProps = {
  totalWeight: string;
  resourceCount: number;
  greenHosting: GreenHostingResult;
};

const KeyFactsSection: React.FC<KeyFactsSectionProps> = ({
  totalWeight,
  resourceCount,
  greenHosting
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-center lg:text-left">Key Facts And Metrics</h4>
        <p className="text-text-secondary lg:w-7/8">
          Key facts and metrics about the page you just analyzed. These will help you understand the
          weight of the resources loaded, the environmental impact of the page and its hosting.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 w-full gap-4">
        <MetricCard
          icon={<TotalSizeIcon />}
          value={totalWeight}
          label="Total Page Weight"
          isPrimary
        />
        <MetricCard icon={<ResourceCountIcon />} value={resourceCount} label="Total Resources" />
        <FactCard
          title={greenHosting.green ? 'Green hosted' : 'Not green hosted'}
          label={
            greenHosting.green
              ? `This page is hosted by ${greenHosting.data?.hosted_by || 'a green provider'} using renewable energy`
              : 'This page is not hosted by a green hosting provider'
          }
          icon={<ServerIcon />}
          isPositive={greenHosting.green}
        />
      </div>
    </div>
  );
};

export default KeyFactsSection;
