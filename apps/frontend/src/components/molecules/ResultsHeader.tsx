import React from 'react';
import AnalysisOptionsDisplay from './AnalysisOptionsDisplay';

type ResultsHeaderProps = {
  url: string;
  deviceType: string;
  interactionLevel: string;
};

const ResultsHeader: React.FC<ResultsHeaderProps> = ({ url, deviceType, interactionLevel }) => {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
      <div>
        <h3 className="text-2xl font-bold">
          Carbon Footprint for:{' '}
          <a className="text-primary underline hover:cursor-pointer" target="_blank" href={url}>
            {url}
          </a>
        </h3>
      </div>
      <AnalysisOptionsDisplay deviceType={deviceType} interactionLevel={interactionLevel} />
    </div>
  );
};

export default ResultsHeader;
