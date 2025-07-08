import React from 'react';
import { BotDetectionResult, BotDetectionIndicator } from '@naubion/shared';
import { cn } from '../../utils/classnames';
import { WarningIcon, ErrorIcon, InfoIcon } from '../icons';

type BotDetectionWarningProps = {
  botDetection: BotDetectionResult;
  className?: string;
};

const BotDetectionWarning: React.FC<BotDetectionWarningProps> = ({ botDetection, className }) => {
  if (!botDetection.detected) {
    return null;
  }

  const getIconForIndicator = (type: BotDetectionIndicator['type']) => {
    switch (type) {
      case 'captcha':
      case 'cloudflare_challenge':
        return <ErrorIcon className="w-4 h-4 text-red-500" />;
      case 'access_denied':
      case 'rate_limit':
        return <WarningIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <InfoIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  };

  const severityLevel = getSeverityLevel(botDetection.confidence);
  const detectedIndicators = botDetection.indicators.filter(i => i.found);

  const severityStyles = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-orange-200 bg-orange-50',
    low: 'border-yellow-200 bg-yellow-50'
  };

  const iconStyles = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-yellow-600'
  };

  return (
    <div className={cn('border rounded-lg p-4', severityStyles[severityLevel], className)}>
      <div className="flex items-start gap-3">
        <WarningIcon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconStyles[severityLevel])} />

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">Bot Detection Warning</h3>

          <p className="text-gray-700 mb-3">
            {botDetection.message || 'Bot detection measures were detected on this page.'}
          </p>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Confidence Level:</span>{' '}
              <span
                className={cn('font-semibold', {
                  'text-red-600': severityLevel === 'high',
                  'text-orange-600': severityLevel === 'medium',
                  'text-yellow-600': severityLevel === 'low'
                })}
              >
                {Math.round(botDetection.confidence * 100)}%
              </span>
            </div>

            {detectedIndicators.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  View Detection Details ({detectedIndicators.length} indicator
                  {detectedIndicators.length !== 1 ? 's' : ''})
                </summary>

                <div className="mt-2 pl-4 space-y-2">
                  {detectedIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {getIconForIndicator(indicator.type)}
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 capitalize">
                          {indicator.type.replace(/_/g, ' ')}
                        </div>
                        {indicator.details && (
                          <div className="text-xs text-gray-600 mt-1">{indicator.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          <div className="mt-3 text-sm text-gray-600 bg-white bg-opacity-60 rounded p-2">
            <strong>Impact:</strong> The carbon footprint analysis was still performed, but it may
            not accurately represent the real user experience for this website.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotDetectionWarning;
