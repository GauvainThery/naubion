import React from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../atoms/ProgressBar';

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
  type: _type,
  label,
  size,
  count,
  percentage,
  average,
  color,
  indicator
}) => {
  const { t } = useTranslation('analysis');

  return (
    <div className="p-4 bg-gray-50 rounded-xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded ${indicator}`} />
          <span className="font-medium">{label}</span>
        </div>
        <div className="text-right">
          <div className="font-semibold">{size}</div>
          <div className="text-sm text-text-secondary">
            ({count} {t('results.resourceBreakdown.files')})
          </div>
        </div>
      </div>

      <ProgressBar progress={percentage} color={color} />

      <div className="flex justify-between items-center text-sm">
        <span className="text-text-secondary">{percentage}%</span>
        <span className="text-text-secondary">
          {t('results.resourceBreakdown.average')} {average}
        </span>
      </div>
    </div>
  );
};

export default ResourceBreakdownItem;
