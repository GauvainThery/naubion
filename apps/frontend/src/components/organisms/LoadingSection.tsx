import React from 'react';
import Card from '../atoms/Card';
import LoadingSpinner from '../atoms/LoadingSpinner';
import LoadingStep from '../molecules/LoadingStep';
import type { LoadingStep as LoadingStepType } from '../../types';

type LoadingSectionProps = {
  steps: LoadingStepType[];
};

const LoadingSection: React.FC<LoadingSectionProps> = ({ steps }) => {
  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Page Weight</h3>

        <div className="flex justify-center mb-6">
          <LoadingSpinner size="lg" />
        </div>

        <p className="text-gray-600">
          This may take a moment as we analyze your website's resources...
        </p>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <LoadingStep
            key={step.id}
            title={step.title}
            description={step.description}
            isActive={true}
            isCompleted={false}
          />
        ))}
      </div>
    </Card>
  );
};

export default LoadingSection;
