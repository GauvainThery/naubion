import React from 'react';
import { useTranslation } from 'react-i18next';
import AnalysisOptionsDisplay from './AnalysisOptionsDisplay';
import { Tooltip, InfoIcon } from '../index';

type ResultsHeaderProps = {
  url: string;
  deviceType: string;
  interactionLevel: string;
  analysisDate: string;
};

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  url,
  deviceType,
  interactionLevel,
  analysisDate
}) => {
  const { t, i18n } = useTranslation('analysis');

  return (
    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-text-secondary flex items-center gap-1">
            {t('results.resultsHeader.lastAnalysisDate')}{' '}
            {new Date(analysisDate).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <Tooltip content={t('results.resultsHeader.cacheTooltip')} position="top">
            <InfoIcon
              className="text-gray-500 hover:text-gray-700 cursor-help"
              width={14}
              height={14}
            />
          </Tooltip>
        </div>
        <h3 className="text-2xl font-bold">
          {t('results.resultsHeader.carbonFootprintFor')}{' '}
          <a
            className="text-primary underline hover:cursor-pointer break-all"
            target="_blank"
            href={url}
          >
            {url}
          </a>
        </h3>
      </div>
      <AnalysisOptionsDisplay deviceType={deviceType} interactionLevel={interactionLevel} />
    </div>
  );
};

export default ResultsHeader;
