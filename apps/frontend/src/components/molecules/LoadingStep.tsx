import React from 'react';
import LoadingSpinner from '../atoms/LoadingSpinner';

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
    <div className={`flex items-start space-x-4 p-4 ${className}`}>
      <div className="flex-shrink-0 mt-1">
        {isCompleted ? (
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
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
          <div className="w-6 h-6 flex items-center justify-center">
            <LoadingSpinner size="sm" className="text-green-600" />
          </div>
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        )}
      </div>
      <div className="flex-1">
        <div
          className={`font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}
        >
          {title}
        </div>
        <div
          className={`text-sm mt-1 ${isActive || isCompleted ? 'text-gray-600' : 'text-gray-400'}`}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export default LoadingStep;
