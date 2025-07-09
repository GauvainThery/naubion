import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('analysis');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-center lg:text-left">
          {t('results.sections.environmentalImpact.title')}
        </h4>
        <p className="text-text-secondary lg:w-7/8">
          {t('results.sections.environmentalImpact.description')}
        </p>
      </div>
      <Slider
        value={visitsCount}
        onChange={onVisitsChange}
        label={t('results.sections.environmentalImpact.monthlyVisitsLabel')}
        description={t('results.sections.environmentalImpact.monthlyVisitsDescription')}
      />
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <MetricCard
          icon={<EarthIcon />}
          value={carbonEmission.value}
          unit={carbonEmission.unit}
          label={t('results.sections.environmentalImpact.totalCarbonEmissions')}
          isPrimary
        />
        <MetricCard
          icon={<CarIcon />}
          value={carEquivalent.value}
          unit={carEquivalent.unit}
          label={t('results.sections.environmentalImpact.equivalentDistance')}
        />
      </div>
    </div>
  );
};

export default EnvironmentalImpactSection;
