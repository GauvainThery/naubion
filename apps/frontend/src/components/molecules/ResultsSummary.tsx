import React from 'react';
import { useTranslation } from 'react-i18next';

type ResultsSummaryProps = {
  url: string;
  isGreenHosted: boolean;
  totalWeight: string;
  visitsCount: number;
  carbonEmission: {
    value: string;
    unit: string;
  };
  carEquivalent: {
    value: string;
    unit: string;
  };
};

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  url,
  isGreenHosted,
  totalWeight,
  visitsCount,
  carbonEmission,
  carEquivalent
}) => {
  const { t } = useTranslation('analysis');

  return (
    <div className="bg-gradient-to-r from-primary to-primary-300 p-6 rounded-lg shadow-md text-gray-200">
      <div className="flex gap-4 items-center">
        <p className="text-2xl">💡</p>
        <p className="leading-relaxed break-words">
          {t('results.summary.pageText')}{' '}
          <a
            className="text-text-light underline hover:cursor-pointer font-medium break-all"
            target="_blank"
            href={url}
          >
            "{url}"
          </a>{' '}
          {t(isGreenHosted ? 'results.summary.isGreenHosted' : 'results.summary.isNotGreenHosted')}{' '}
          {t('results.summary.greenHostedText')}{' '}
          <span className="font-semibold text-text-light">{totalWeight}</span>
          .<br />
          <span className="font-semibold text-text-light">{visitsCount.toLocaleString()}</span>{' '}
          {t('results.summary.visitsText')}{' '}
          <span className="font-semibold text-text-light">
            {carbonEmission.value} {carbonEmission.unit}
          </span>
          {t('results.summary.equivalentText')}{' '}
          <span className="font-semibold text-text-light">
            {carEquivalent.value} {carEquivalent.unit}
          </span>{' '}
          {t('results.summary.carText')}
        </p>
      </div>
    </div>
  );
};

export default ResultsSummary;
