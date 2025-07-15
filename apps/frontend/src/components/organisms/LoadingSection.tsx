import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LoadingStep as LoadingStepType } from '../../types';
import Card from '../atoms/Card';
import LoadingStep from '../molecules/LoadingStep';
import ProgressBar from '../atoms/ProgressBar';
import { cn } from './../../utils/classnames';

type LoadingSectionProps = {
  steps: LoadingStepType[];
  progress?: number;
  currentStep?: string;
  currentMessage?: string;
  estimatedDuration?: number;
  className?: string;
};

const LoadingSection: React.FC<LoadingSectionProps> = ({
  steps,
  progress = 0,
  currentStep = '',
  currentMessage = '',
  estimatedDuration = 0,
  className
}) => {
  const { t } = useTranslation('analysis');
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Start timer when analysis begins
  useEffect(() => {
    if (estimatedDuration > 0 && startTime === null) {
      setStartTime(Date.now());
    }
  }, [estimatedDuration, startTime]);

  // Time-based progress bar that moves continuously based on remaining time
  useEffect(() => {
    if (!startTime || !estimatedDuration || progress >= 100) {
      // If no time data or analysis complete, just use backend progress
      setSmoothProgress(progress);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeProgress = Math.min((elapsed / estimatedDuration) * 100, 99); // Cap at 99% until backend confirms completion

      // Use the higher of time-based progress or backend progress for smoother experience
      const targetProgress = Math.max(timeProgress, progress);

      setSmoothProgress(prev => {
        const diff = targetProgress - prev;
        // Smooth interpolation - move 10% of the difference each update
        return prev + diff * 0.1;
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [startTime, estimatedDuration, progress]);

  // Calculate remaining time based on actual progress and estimated duration
  const calculateRemainingTime = () => {
    if (!estimatedDuration || !startTime || smoothProgress >= 100) {
      return 0;
    }

    const elapsed = Date.now() - startTime;

    return Math.ceil(
      (estimatedDuration - estimatedDuration * (smoothProgress / 100) - elapsed) / 1000
    );
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
    const remainingSecondsInMinute = seconds % 60;
    return `${minutes}m ${remainingSecondsInMinute}s`;
  };

  // Step mapping - more accurate to backend step names
  const stepMapping: Record<string, number> = {
    cache: 0,
    setup: 1,
    navigation: 2,
    simulation: 3,
    processing: 4,
    'green-hosting': 5,
    'co2e-conversion': 6,
    'impact-calculation': 7,
    finalizing: 8,
    complete: 8
  };

  // Determine step states based on current progress and step
  const getStepState = (index: number) => {
    const currentStepIndex = stepMapping[currentStep.toLowerCase()] ?? -1;

    return {
      isCompleted: index < currentStepIndex || smoothProgress >= 100,
      isActive: index === currentStepIndex && smoothProgress < 100
    };
  };

  return (
    <section className={cn('container', className)} aria-live="polite" aria-busy="true">
      <Card className="p-12 flex flex-col gap-12">
        <h3 className="text-2xl font-bold">{t('loading.title')}</h3>

        {smoothProgress > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-bold">{t('loading.progress')}</span>
              <div className="flex items-center space-x-3">
                <span
                  className="font-bold transition-all duration-300 transform text-lg"
                  aria-live="polite"
                >
                  {Math.round(smoothProgress)}%
                </span>
                {remainingSeconds > 0 && smoothProgress < 100 && (
                  <span className="text-sm text-text-secondary px-2 py-1 bg-gray-100 rounded-full">
                    ~{formatTime(remainingSeconds)} {t('loading.remaining')}
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
            {(currentStep || currentMessage) && (
              <div className="text-sm text-text-secondary italic" role="status" aria-live="polite">
                {currentMessage || `Current: ${currentStep}`}
              </div>
            )}
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
