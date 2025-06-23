import React from 'react';
import LoadingSpinner from '../atoms/LoadingSpinner';
import { cn } from './../../utils/classnames';

type LoadingStepProps = {
  step: {
    id: string;
    title: string;
    description: string;
  };
  isActive: boolean;
  isCompleted: boolean;
};

type ExtendedLoadingStepProps = Omit<LoadingStepProps, 'step'> & {
  title: string;
  description: string;
  className?: string;
};

const LoadingStep: React.FC<ExtendedLoadingStepProps> = ({
  title,
  description,
  isActive = false,
  isCompleted = false,
  className = ''
}) => {
  return (
    <div className={`flex items-start gap-4 transition-all duration-500 ease-out ${className}`}>
      <div className="flex mt-1">
        {isCompleted ? (
          <div className="w-6 h-6 bg-gradient-to-r from-primary to-primary-300 rounded-full flex items-center justify-center drop-shadow shadow-primary-500/30 transition-all duration-300 transform scale-110">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        ) : isActive ? (
          <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-r from-primary to-primary-300 rounded-full drop-shadow transition-all duration-300">
            <LoadingSpinner size="sm" className="text-white" />
          </div>
        ) : (
          <div className="opacity-50 w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full border-gray-200 transition-all drop-shadow duration-300" />
        )}
      </div>
      <div className="flex flex-col transition-all duration-300">
        <div
          className={cn(
            'font-medium transition-all duration-300',
            isActive || isCompleted ? '' : 'opacity-50'
          )}
        >
          {title}
        </div>
        <div
          className={cn(
            'text-sm transition-all duration-300 text-text-secondary transform',
            isActive || isCompleted ? '' : 'opacity-50'
          )}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export default LoadingStep;
