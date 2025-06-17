import React from 'react';
import { cn } from '../../utils/classnames';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  description?: string;
  formatValue?: (value: number) => string;
  className?: string;
  disabled?: boolean;
  recommendation?: {
    value: number;
    label: string;
  };
};

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  description,
  formatValue = val => val.toString(),
  className,
  disabled = false,
  recommendation
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const recommendationPercentage = recommendation
    ? ((recommendation.value - min) / (max - min)) * 100
    : null;

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <span className="text-sm font-semibold text-blue-600">{formatValue(value)}</span>
        </div>
      )}

      {description && <p className="text-sm text-gray-600">{description}</p>}

      <div className="relative">
        {/* Track */}
        <div className="h-2 bg-gray-200 rounded-full relative">
          {/* Progress */}
          <div
            className="h-2 bg-blue-500 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${percentage}%` }}
          />

          {/* Recommendation marker */}
          {recommendation && recommendationPercentage !== null && (
            <div
              className="absolute top-0 h-2 w-1 bg-green-500 rounded-full"
              style={{ left: `${recommendationPercentage}%` }}
              title={`Recommended: ${recommendation.label}`}
            />
          )}
        </div>

        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            'absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer',
            disabled && 'cursor-not-allowed'
          )}
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full transform -translate-y-1/2 -translate-x-1/2 shadow-md transition-all duration-200 ease-out',
            disabled ? 'border-gray-400 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Recommendation info */}
      {recommendation && (
        <div className="flex items-center text-xs text-green-600">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Recommended: {recommendation.label}
        </div>
      )}
    </div>
  );
};

export default Slider;
