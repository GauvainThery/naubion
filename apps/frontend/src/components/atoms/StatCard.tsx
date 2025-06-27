import React from 'react';
import { cn } from '../../utils/classnames';

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200'
  };

  const valueColors = {
    default: 'text-primary',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  return (
    <div
      className={cn(
        'p-6 rounded-xl border-2 shadow-sm transition-all duration-200 hover:shadow-md',
        variants[variant],
        className
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-gray-500">{icon}</div>}
        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</span>
      </div>
      <div className={cn('text-3xl font-bold', valueColors[variant])}>{value}</div>
    </div>
  );
};

export default StatCard;
