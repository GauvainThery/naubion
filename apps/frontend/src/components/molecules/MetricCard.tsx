import React from 'react';
import Card from '../atoms/Card';

type MetricCardProps = {
  title?: string;
  value: string | number;
  unit?: string;
  description?: string;
  className?: string;
};

type ExtendedMetricCardProps = MetricCardProps & {
  icon?: React.ReactNode;
  label?: string;
  isPrimary?: boolean;
};

const MetricCard: React.FC<ExtendedMetricCardProps> = ({
  icon,
  value,
  title,
  label,
  isPrimary = false,
  className = ''
}) => {
  return (
    <Card
      className={`p-6 ${isPrimary ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' : ''} ${className}`}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`p-3 rounded-xl ${isPrimary ? 'bg-white/20' : 'bg-green-100 text-green-600'}`}
        >
          {icon}
        </div>
        <div>
          <div className={`text-2xl font-bold ${isPrimary ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </div>
          <div className={`text-sm ${isPrimary ? 'text-white/80' : 'text-gray-600'}`}>
            {label || title}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
