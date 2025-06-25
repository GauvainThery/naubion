import React from 'react';
import { MetricCard, Slider, EarthIcon, CarIcon } from '../';

type EnvironmentalImpactSectionProps = {
  visitsCount: number;
  onVisitsChange: (value: number) => void;
  carbonEmission: {
    value: string;
    unit: string;
  };
  carEquivalent: {
    value: string;
    unit: string;
  };
};

const EnvironmentalImpactSection: React.FC<EnvironmentalImpactSectionProps> = ({
  visitsCount,
  onVisitsChange,
  carbonEmission,
  carEquivalent
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-center lg:text-left">
          Monthly Environmental Impact
        </h4>
        <p className="text-text-secondary lg:w-7/8">
          Adjust the monthly visits count to see how it affects the carbon emissions and the
          equivalent distance driven by a gasoline car. This will help you understand the
          environmental impact of your page based on its traffic.
        </p>
      </div>
      <Slider
        value={visitsCount}
        onChange={onVisitsChange}
        label="Monthly Visits On This Page"
        description="Adjust the carbon footprint calculation based on your page's monthly visits count"
      />
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <MetricCard
          icon={<EarthIcon />}
          value={carbonEmission.value}
          unit={carbonEmission.unit}
          label="Total Carbon Emissions"
          isPrimary
        />
        <MetricCard
          icon={<CarIcon />}
          value={carEquivalent.value}
          unit={carEquivalent.unit}
          label="Equivalent Distance by Gasoline Car"
        />
      </div>
    </div>
  );
};

export default EnvironmentalImpactSection;
