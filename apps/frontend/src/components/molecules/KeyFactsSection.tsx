import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('analysis');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-center lg:text-left">
          {t('results.sections.keyFacts.title')}
        </h4>
        <p className="text-text-secondary lg:w-7/8">{t('results.sections.keyFacts.description')}</p>
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 w-full gap-4">
        <MetricCard
          icon={<TotalSizeIcon />}
          value={totalWeight}
          label={t('results.sections.keyFacts.totalPageWeight')}
          isPrimary
        />
        <MetricCard
          icon={<ResourceCountIcon />}
          value={resourceCount}
          label={t('results.sections.keyFacts.totalResources')}
        />
        <FactCard
          title={
            greenHosting.green
              ? t('results.sections.keyFacts.greenHosted')
              : t('results.sections.keyFacts.notGreenHosted')
          }
          label={
            greenHosting.green
              ? greenHosting.data?.hosted_by
                ? t('results.sections.keyFacts.greenHostedDescription', {
                    provider: greenHosting.data.hosted_by
                  })
                : t('results.sections.keyFacts.greenHostedDescriptionGeneric')
              : t('results.sections.keyFacts.notGreenHostedDescription')
          }
          icon={<ServerIcon />}
          isPositive={greenHosting.green}
        />
      </div>
    </div>
  );
};

export default KeyFactsSection;
