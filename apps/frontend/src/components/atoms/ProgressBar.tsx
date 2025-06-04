import React from 'react';

type ProgressBarProps = {
  progress: number;
  className?: string;
};

type ExtendedProgressBarProps = ProgressBarProps & {
  percentage?: number;
  color?: 'primary' | 'html' | 'css' | 'js' | 'media' | 'font' | 'other';
};

const ProgressBar: React.FC<ExtendedProgressBarProps> = ({
  progress,
  percentage,
  className = '',
  color = 'primary'
}) => {
  const value = progress ?? percentage ?? 0;
  const colorClasses = {
    primary: 'bg-green-600',
    html: 'bg-blue-500',
    css: 'bg-purple-500',
    js: 'bg-yellow-500',
    media: 'bg-green-500',
    font: 'bg-pink-500',
    other: 'bg-gray-500'
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export default ProgressBar;
