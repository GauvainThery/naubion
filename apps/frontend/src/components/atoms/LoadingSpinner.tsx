import { cn } from './../../utils/classnames';
import React from 'react';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={cn(
        sizes[size],
        'border-2 border-current border-t-transparent rounded-full animate-spin',
        className
      )}
    />
  );
};

export default LoadingSpinner;
