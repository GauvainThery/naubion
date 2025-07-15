import { cn } from './../../utils/classnames';
import React from 'react';

type ProgressBarProps = {
  progress: number;
  className?: string;
};

type ExtendedProgressBarProps = ProgressBarProps & {
  percentage?: number;
  color?: 'primary' | 'html' | 'css' | 'js' | 'media' | 'font' | 'other';
  animated?: boolean;
  showGlow?: boolean;
};

const ProgressBar: React.FC<ExtendedProgressBarProps> = ({
  progress,
  percentage,
  className = '',
  color = 'primary',
  animated = true,
  showGlow = true
}) => {
  const value = progress ?? percentage ?? 0;

  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-r from-primary-300 to-primary-500',
      glow: 'shadow-primary-500/50',
      shimmer: 'from-primary-300 via-primary to-primary-300'
    },
    html: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/50',
      shimmer: 'from-blue-400 via-blue-300 to-blue-400'
    },
    css: {
      bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/50',
      shimmer: 'from-purple-400 via-purple-300 to-purple-400'
    },
    js: {
      bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      glow: 'shadow-yellow-500/50',
      shimmer: 'from-yellow-400 via-yellow-300 to-yellow-400'
    },
    media: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      glow: 'shadow-green-500/50',
      shimmer: 'from-green-400 via-green-300 to-green-400'
    },
    font: {
      bg: 'bg-gradient-to-r from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/50',
      shimmer: 'from-pink-400 via-pink-300 to-pink-400'
    },
    other: {
      bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
      glow: 'shadow-gray-500/50',
      shimmer: 'from-gray-400 via-gray-300 to-gray-400'
    }
  };

  const currentColor = colorClasses[color];
  const glowClass = showGlow ? `shadow-lg ${currentColor.glow}` : '';
  const animationClass = animated ? 'transition-all duration-700 ease-out' : '';

  return (
    <div
      className={cn('relative w-full bg-gray-200 rounded-full h-3 overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${Math.round(value)}%`}
    >
      {/* Background track with subtle inner shadow */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner" />

      {/* Progress fill */}
      <div
        className={cn('relative h-full rounded-full', currentColor.bg, animationClass, glowClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      >
        {/* Animated shimmer effect */}
        {animated && value > 0 && value < 100 && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-r rounded-full',
                currentColor.shimmer,
                'opacity-30 progress-shimmer'
              )}
            />
          </div>
        )}

        {/* Highlight on top for 3D effect */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
      </div>
    </div>
  );
};

export default ProgressBar;
