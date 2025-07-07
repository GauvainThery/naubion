import React from 'react';

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
  return (
    <div className="bg-gradient-to-r from-primary to-primary-300 p-6 rounded-lg shadow-md text-gray-200">
      <div className="flex gap-4 items-center">
        <p className="text-2xl">💡</p>
        <p className="leading-relaxed break-words">
          The page{' '}
          <a
            className="text-text-light underline hover:cursor-pointer font-medium break-all"
            target="_blank"
            href={url}
          >
            "{url}"
          </a>{' '}
          is {isGreenHosted ? '' : 'potentially not '}green hosted and weighs a total of{' '}
          <span className="font-semibold text-text-light">{totalWeight}</span>
          .<br />
          <span className="font-semibold text-text-light">{visitsCount.toLocaleString()}</span>{' '}
          visits on this unique page per month would emit a total of{' '}
          <span className="font-semibold text-text-light">
            {carbonEmission.value} {carbonEmission.unit}
          </span>
          , the equivalent of driving{' '}
          <span className="font-semibold text-text-light">
            {carEquivalent.value} {carEquivalent.unit}
          </span>{' '}
          by gasoline car.
        </p>
      </div>
    </div>
  );
};

export default ResultsSummary;
