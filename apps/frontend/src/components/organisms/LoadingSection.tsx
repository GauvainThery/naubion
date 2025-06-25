import React from 'react';
import type { LoadingStep as LoadingStepType } from '../../types';
import Card from '../atoms/Card';
import LoadingStep from '../molecules/LoadingStep';
import ProgressBar from '../atoms/ProgressBar';
import { cn } from './../../utils/classnames';

type LoadingSectionProps = {
  steps: LoadingStepType[];
  progress?: number;
  currentStep?: string;
  estimatedDuration?: number;
  className?: string;
};

const LoadingSection: React.FC<LoadingSectionProps> = ({
  steps,
  progress = 0,
  currentStep = '',
  estimatedDuration = 0,
  className
}) => {
  // Calculate remaining time based on progress and estimated duration
  const calculateRemainingTime = () => {
    if (!estimatedDuration || progress >= 100) return 0;
    const remainingProgress = (100 - progress) / 100;
    return Math.ceil((estimatedDuration * remainingProgress) / 1000); // Convert to seconds
  };

  const remainingSeconds = calculateRemainingTime();

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Determine step states based on current progress and step
  const getStepState = (step: LoadingStepType, index: number) => {
    const stepNames = ['setup', 'navigation', 'simulation', 'processing'];
    const currentStepIndex = stepNames.indexOf(currentStep.toLowerCase());

    if (currentStepIndex === -1) {
      // If we can't match the step name, use progress percentage
      const stepProgress = (index + 1) * 25; // Each step is roughly 25%
      return {
        isCompleted: progress > stepProgress,
        isActive: progress >= stepProgress - 25 && progress <= stepProgress
      };
    }

    return {
      isCompleted: index < currentStepIndex,
      isActive: index === currentStepIndex
    };
  };

  return (
    <section className={cn('container', className)}>
      <Card className="p-12 flex flex-col gap-12">
        <h3 className="text-2xl font-bold">Analyzing your page...</h3>

        {progress > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-bold">Progress</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold transition-all duration-300 transform">
                  {Math.round(progress)}%
                </span>
                {remainingSeconds > 0 && (
                  <span className="text-xs text-text-secondary">
                    (~{formatTime(remainingSeconds)} remaining)
                  </span>
                )}
              </div>
            </div>
            <ProgressBar progress={progress} className="h-4" animated={true} showGlow={true} />
          </div>
        )}

        <div className="flex flex-col gap-10">
          {steps.map((step, index) => {
            const { isActive, isCompleted } = getStepState(step, index);
            return (
              <LoadingStep
                key={step.id}
                title={step.title}
                description={step.description}
                isActive={isActive}
                isCompleted={isCompleted}
              />
            );
          })}
        </div>
      </Card>
    </section>
  );
};

export default LoadingSection;
