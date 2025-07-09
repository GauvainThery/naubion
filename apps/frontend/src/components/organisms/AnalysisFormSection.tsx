import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalysisFormData } from '../../types';
import Button from '../atoms/Button';
import Card from '../atoms/Card';
import Input from '../atoms/Input';
import { SearchIcon } from '../icons';
import RadioGroup from '../molecules/RadioGroup';
import { cn } from './../../utils/classnames';

type AnalysisFormProps = {
  onSubmit: (data: AnalysisFormData) => void;
  isLoading: boolean;
  className?: string;
};

const DEFAULT_FORM_DATA: AnalysisFormData = {
  url: '',
  interactionLevel: 'default',
  deviceType: 'desktop'
};

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onSubmit, isLoading, className }) => {
  const { t } = useTranslation('analysis');
  const [formData, setFormData] = useState<AnalysisFormData>(DEFAULT_FORM_DATA);

  // Check for URL parameters on mount and populate form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Support both 'url' and 'websiteUrl' parameters
    const urlParam = urlParams.get('url') || urlParams.get('websiteUrl');

    if (urlParam) {
      const interactionLevel =
        (urlParams.get('interactionLevel') as 'minimal' | 'default' | 'thorough') || 'default';
      const deviceType = (urlParams.get('deviceType') as 'desktop' | 'mobile') || 'desktop';

      setFormData({
        url: urlParam,
        interactionLevel: ['minimal', 'default', 'thorough'].includes(interactionLevel)
          ? interactionLevel
          : 'default',
        deviceType: ['desktop', 'mobile'].includes(deviceType) ? deviceType : 'desktop'
      });
    }
  }, []);

  // Update URL parameters live as form data changes (debounced for better performance)
  useEffect(() => {
    const updateUrlParams = () => {
      const params = new URLSearchParams();

      // Only add parameters if they differ from defaults or if URL is provided
      if (formData.url) {
        params.set('websiteUrl', formData.url);
      }

      if (formData.interactionLevel !== DEFAULT_FORM_DATA.interactionLevel) {
        params.set('interactionLevel', formData.interactionLevel);
      }

      if (formData.deviceType !== DEFAULT_FORM_DATA.deviceType) {
        params.set('deviceType', formData.deviceType);
      }

      // Update the URL without causing a page reload
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      window.history.replaceState({}, '', newUrl);
    };

    // Debounce URL updates for better performance (especially while typing)
    const timeoutId = setTimeout(updateUrlParams, 300);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const interactionLevelOptions = [
    {
      value: 'minimal',
      id: 'interactionMinimal',
      title: t('form.interactionLevel.minimal.title'),
      description: t('form.interactionLevel.minimal.description')
    },
    {
      value: 'default',
      id: 'interactionDefault',
      title: t('form.interactionLevel.default.title'),
      description: t('form.interactionLevel.default.description')
    },
    {
      value: 'thorough',
      id: 'interactionThorough',
      title: t('form.interactionLevel.thorough.title'),
      description: t('form.interactionLevel.thorough.description')
    }
  ];

  const deviceTypeOptions = [
    {
      value: 'desktop',
      id: 'deviceDesktop',
      title: t('form.deviceType.desktop.title'),
      description: t('form.deviceType.desktop.description')
    },
    {
      value: 'mobile',
      id: 'deviceMobile',
      title: t('form.deviceType.mobile.title'),
      description: t('form.deviceType.mobile.description')
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

  return (
    <section className={cn('container', className)}>
      <Card className="p-12 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <p className="text-text-secondary lg:w-7/8">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-12">
          <div className="flex gap-3 w-full items-center">
            <Input
              type="url"
              placeholder={t('form.urlPlaceholder')}
              value={formData.url}
              onChange={e => handleInputChange('url', e.target.value)}
              required
              icon={<SearchIcon />}
            />
            <Button type="button" variant="secondary" onClick={handleClear} disabled={isLoading}>
              {t('form.clearButton')}
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row w-full gap-8">
            <div className="w-full flex flex-col gap-3">
              <label className="block text-sm font-bold">{t('form.interactionLevel.label')}</label>
              <RadioGroup
                options={interactionLevelOptions}
                name="interactionLevel"
                value={formData.interactionLevel}
                onChange={e => handleInputChange('interactionLevel', e.target.value)}
              />
            </div>
            <div className="w-full flex flex-col gap-3">
              <label className="block text-sm font-bold">{t('form.deviceType.label')}</label>
              <RadioGroup
                options={deviceTypeOptions}
                name="deviceType"
                value={formData.deviceType}
                onChange={e => handleInputChange('deviceType', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center w-full">
            <Button type="submit" loading={isLoading} disabled={!formData.url || isLoading}>
              {t('form.analyzeButton')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default AnalysisForm;
