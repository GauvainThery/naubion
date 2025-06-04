import React from 'react';
import ProgressBar from '../atoms/ProgressBar';

type ResourceBreakdownItemProps = {
  category: string;
  data: {
    size: number;
    count: number;
    percentage: number;
  };
};

type ExtendedResourceBreakdownItemProps = {
  type: string;
  label: string;
  size: string | number;
  count: string | number;
  percentage: number;
  average?: string;
  color?: 'primary' | 'html' | 'css' | 'js' | 'media' | 'font' | 'other';
  indicator?: string;
};

const ResourceBreakdownItem: React.FC<ExtendedResourceBreakdownItemProps> = ({
  type,
  label,
  size,
  count,
  percentage,
  average,
  color,
  indicator
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded ${indicator}`} />
          <span className="font-medium text-gray-900">{label}</span>
        </div>
        <div className="text-right">
          <div className="font-semibold text-gray-900">{size}</div>
          <div className="text-sm text-gray-500">({count} files)</div>
        </div>
      </div>

      <ProgressBar progress={percentage} color={color} className="mb-2" />

      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">{percentage}%</span>
        <span className="text-gray-500">Avg: {average}</span>
      </div>
    </div>
  );
};

export default ResourceBreakdownItem;
