import React from 'react';
import { cn } from '../../utils/classnames';
import Card from '../atoms/Card';

type FactCardProps = {
  title: string;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  isPositive?: boolean;
};

const FactCard: React.FC<FactCardProps> = ({
  title,
  className = '',
  icon,
  label,
  isPositive = false
}) => {
  return (
    <Card
      className={cn(
        'p-6 w-full border-2',
        isPositive ? ' border-primary' : 'border-utils-600',
        className
      )}
    >
      <div className={cn('flex items-center gap-4')}>
        <div
          className={cn(
            'p-3 rounded-xl',
            isPositive ? 'bg-primary/10 text-primary' : 'bg-utils-600/10 text-shadow-utils-600'
          )}
        >
          {icon}
        </div>
        <div>
          <div className={cn('text-2xl font-bold')}>{title}</div>
          <div className={cn('text-sm')}>{label}</div>
        </div>
      </div>
    </Card>
  );
};

export default FactCard;
