import React from 'react';

type AnalysisOptionsDisplayProps = {
  deviceType: string;
  interactionLevel: string;
};

const AnalysisOptionsDisplay: React.FC<AnalysisOptionsDisplayProps> = ({
  deviceType,
  interactionLevel
}) => {
  return (
    <div className="flex gap-2">
      <div className="p-3 bg-gray-50 flex flex-col gap-1 rounded-lg">
        <p className="text-gray-600">
          {deviceType.charAt(0).toUpperCase()}
          {deviceType.slice(1)}
        </p>
        <p className="text-text-secondary text-xs">Device Type</p>
      </div>
      <div className="p-3 bg-gray-50 flex flex-col gap-1 rounded-lg">
        <p className="text-gray-600">
          {interactionLevel.charAt(0).toUpperCase()}
          {interactionLevel.slice(1)}
        </p>
        <p className="text-text-secondary text-xs">Interaction Level</p>
      </div>
    </div>
  );
};

export default AnalysisOptionsDisplay;
