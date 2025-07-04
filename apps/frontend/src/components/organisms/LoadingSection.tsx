import React, { useEffect, useState } from 'react';
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
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Start timer when analysis begins or when estimatedDuration changes
  useEffect(() => {
    if (estimatedDuration > 0) {
      setStartTime(Date.now());
      setSmoothProgress(0); // Reset progress when we get a new duration
    }
  }, [estimatedDuration]); // Remove startTime dependency to allow reset

  // Smooth time-based progress
  useEffect(() => {
    if (!startTime || !estimatedDuration) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeProgress = (elapsed / estimatedDuration) * 100;

      // Add the backend progress to the time-based progress for a combined calculation
      const targetProgress = Math.min(progress + timeProgress, progress);
      setSmoothProgress(targetProgress);
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [startTime, estimatedDuration, progress]);

  // Calculate remaining time based on smooth progress and estimated duration
  const calculateRemainingTime = () => {
    if (!estimatedDuration || smoothProgress >= 100) {
      return 0;
    }
    const remainingProgress = (100 - smoothProgress) / 100;
    return Math.ceil((estimatedDuration * remainingProgress) / 1000); // Convert to seconds
  };

  const remainingSeconds = calculateRemainingTime();

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds <= 0) {
      return '';
    }

    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Determine step states based on current progress and step
  const getStepState = (index: number) => {
    const currentStepIndex = steps
      .map(step => step.title.toLowerCase())
      .indexOf(currentStep.toLowerCase());

    return {
      isCompleted: index < currentStepIndex,
      isActive: index === currentStepIndex
    };
  };

  return (
    <section className={cn('container', className)}>
      <Card className="p-12 flex flex-col gap-12">
        <h3 className="text-2xl font-bold">Analyzing your page...</h3>

        {smoothProgress > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-bold">Progress</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold transition-all duration-300 transform">
                  {Math.round(smoothProgress)}%
                </span>
                {remainingSeconds > 0 && (
                  <span className="text-xs text-text-secondary">
                    (~{formatTime(remainingSeconds)} remaining)
                  </span>
                )}
              </div>
            </div>
            <ProgressBar
              progress={smoothProgress}
              className="h-4"
              animated={true}
              showGlow={true}
            />
          </div>
        )}

        <div className="flex flex-col gap-10">
          {steps.map((step, index) => {
            const { isActive, isCompleted } = getStepState(index);
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
