import React from 'react';
import { cn } from '../../utils/classnames';
import Card from '../atoms/Card';

type MetricCardProps = {
  value: string | number;
  unit?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  isPrimary?: boolean;
};

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  isPrimary = false,
  className = ''
}) => {
  return (
    <Card
      className={cn(
        'p-6 w-full',
        isPrimary && 'bg-gradient-to-br from-primary-300 to-primary-500 text-white',
        className
      )}
    >
      <div className={cn('flex items-center gap-4')}>
        <div
          className={cn('p-3 rounded-xl', isPrimary ? 'bg-white/20' : 'bg-primary/10 text-primary')}
        >
          {icon}
        </div>
        <div>
          <div className={cn('text-2xl font-bold', isPrimary ? 'text-white' : '')}>{value}</div>
          <div className={cn('text-sm', isPrimary ? 'text-white/80' : '')}>{label}</div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
