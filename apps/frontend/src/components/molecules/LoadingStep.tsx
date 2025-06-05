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
    <div
      className={`flex items-start space-x-4 p-4 transition-all duration-500 ease-out ${className}`}
    >
      <div className="flex-shrink-0 mt-1">
        {isCompleted ? (
          <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all duration-300 transform scale-110">
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
          <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-r from-emerald-100 to-green-100 rounded-full shadow-md transition-all duration-300 animate-pulse">
            <LoadingSpinner size="sm" className="text-emerald-600" />
          </div>
        ) : (
          <div className="w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full border-2 border-gray-200 transition-all duration-300" />
        )}
      </div>
      <div className="flex-1 transition-all duration-300">
        <div
          className={`font-medium transition-all duration-300 ${
            isActive || isCompleted ? 'text-gray-900 transform translate-x-1' : 'text-gray-500'
          }`}
        >
          {title}
        </div>
        <div
          className={`text-sm mt-1 transition-all duration-300 ${
            isActive || isCompleted ? 'text-gray-600 transform translate-x-1' : 'text-gray-400'
          }`}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export default LoadingStep;
