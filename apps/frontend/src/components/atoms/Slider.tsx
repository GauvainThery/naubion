import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/classnames';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
};

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  label,
  description,
  className,
  disabled = false
}) => {
  const { t } = useTranslation('analysis');
  const sliderId = `slider-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `${sliderId}-description` : undefined;

  // Convert actual value to slider position (0-100)
  const actualToSlider = (actualValue: number): number => {
    if (actualValue <= 1) return 1;
    if (actualValue >= 100000) return 100;

    if (actualValue <= 10000) {
      // Linear interpolation between 0 and middle point
      return (actualValue / 10000) * 50;
    } else {
      // Linear interpolation between middle point and end
      return 50 + ((actualValue - 10000) / (100000 - 10000)) * 50;
    }
  };

  // Convert slider position (0-100) to actual value
  const sliderToActual = (sliderValue: number): number => {
    if (sliderValue <= 1) return 1;
    if (sliderValue >= 100) return 100000;

    if (sliderValue <= 50) {
      // Linear interpolation between 0 and middle point
      return (sliderValue / 50) * 10000;
    } else {
      // Linear interpolation between middle point and end
      return 10000 + ((sliderValue - 50) / 50) * (100000 - 10000);
    }
  };

  const sliderValue = actualToSlider(value);
  const percentage = sliderValue;

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className={cn('flex flex-col gap-3', className)}>
        {label && (
          <div className="flex items-center justify-between">
            <label htmlFor={sliderId}>{label}</label>
          </div>
        )}

        {description && (
          <p id={descriptionId} className="text-sm text-text-secondary">
            {description}
          </p>
        )}

        <div className="relative">
          {/* Track */}
          <div className="h-3 bg-gray-200 rounded-full relative shadow-inner">
            {/* Progress */}
            <div
              className="h-3 bg-gradient-to-r from-primary-300 to-primary-500 rounded-full transition-all duration-200 ease-out relative overflow-hidden "
              style={{ width: `${percentage}%` }}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r rounded-full from-primary-300 via-primary to-primary-300 opacity-30 progress-shimmer'
                )}
              />
            </div>
          </div>

          {/* Slider input */}
          <input
            id={sliderId}
            type="range"
            min={1}
            max={100}
            step={0.1}
            value={sliderValue}
            disabled={disabled}
            aria-describedby={descriptionId}
            aria-valuemin={1}
            aria-valuemax={100000}
            aria-valuenow={value}
            aria-valuetext={`${value.toLocaleString()} ${value === 1 ? t('results.environmentalImpact.visit') : t('results.environmentalImpact.visits')}`}
            onChange={e => {
              const newSliderValue = Number(e.target.value);
              const newActualValue = Math.round(sliderToActual(newSliderValue));
              onChange(newActualValue);
            }}
            className={cn(
              'absolute top-0 left-0 w-full h-2 opacity-0 cursor-grab active:cursor-grabbing',
              disabled && 'cursor-not-allowed'
            )}
          />

          {/* Thumb */}
          <div
            className={cn(
              'absolute top-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full transform -translate-y-1/2 -translate-x-1/2 shadow-md transition-all duration-200 ease-out pointer-events-none',
              disabled ? 'border-gray-400 cursor-not-allowed' : 'cursor-grab'
            )}
            style={{ left: `${percentage}%` }}
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('results.slider.currentEstimate')}{' '}
            <span className="font-semibold text-primary">
              {value.toLocaleString()}{' '}
              {value === 1 ? t('results.slider.visit') : t('results.slider.visits')}
              {t('results.slider.perMonth')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Slider;
