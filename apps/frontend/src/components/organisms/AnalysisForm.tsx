import React, { useState } from 'react';
import Card from '../atoms/Card';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import RadioGroup from '../molecules/RadioGroup';
import type { AnalysisFormData } from '../../types';

type AnalysisFormProps = {
  onSubmit: (data: AnalysisFormData) => void;
  isLoading: boolean;
};

const DEFAULT_FORM_DATA: AnalysisFormData = {
  url: '',
  averagePages: 5,
  interactionLevel: 'default',
  deviceType: 'desktop'
};

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<AnalysisFormData>(DEFAULT_FORM_DATA);

  const interactionLevelOptions = [
    {
      value: 'minimal',
      id: 'interactionMinimal',
      title: 'Minimal',
      description: 'Basic scrolling and reading'
    },
    {
      value: 'default',
      id: 'interactionDefault',
      title: 'Normal',
      description: 'Scrolling, hover effects, and basic interactions'
    },
    {
      value: 'thorough',
      id: 'interactionThorough',
      title: 'Thorough',
      description: 'Full interaction with most of the elements'
    }
  ];

  const deviceTypeOptions = [
    {
      value: 'desktop',
      id: 'deviceDesktop',
      title: 'Desktop',
      description: '1920x1080 with mouse interactions'
    },
    {
      value: 'mobile',
      id: 'deviceMobile',
      title: 'Mobile',
      description: '375x667 with touch interactions'
    }
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof AnalysisFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  const searchIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M9 2C5.13 2 2 5.13 2 9C2 12.87 5.13 16 9 16C12.87 16 16 12.87 16 9C16 5.13 12.87 2 9 2ZM9 14C6.24 14 4 11.76 4 9C4 6.24 6.24 4 9 4C11.76 4 14 6.24 14 9C14 11.76 11.76 14 9 14Z"
        fill="currentColor"
      />
      <path d="M15.5 14.5L19 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Weight Analysis</h2>
        <p className="text-gray-600">
          Enter a URL to get a comprehensive breakdown of page weight, resource sizes, and
          optimization opportunities
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Input
            type="url"
            placeholder="https://example.com"
            value={formData.url}
            onChange={e => handleInputChange('url', e.target.value)}
            required
            icon={searchIcon}
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Visitor Interaction Level
            </label>
            <RadioGroup
              options={interactionLevelOptions}
              name="interactionLevel"
              value={formData.interactionLevel}
              onChange={e => handleInputChange('interactionLevel', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Device Type</label>
            <RadioGroup
              options={deviceTypeOptions}
              name="deviceType"
              value={formData.deviceType}
              onChange={e => handleInputChange('deviceType', e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            loading={isLoading}
            disabled={!formData.url || isLoading}
            className="flex-1"
          >
            Analyze
          </Button>
          <Button type="button" variant="secondary" onClick={handleClear} disabled={isLoading}>
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AnalysisForm;
