import React, { useState, useEffect } from 'react';
import Card from '../atoms/Card';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import RadioGroup from '../molecules/RadioGroup';
import Slider from '../atoms/Slider';
import type { WebsiteAnalysisFormData } from '../../types';

type WebsiteAnalysisFormProps = {
  onSubmit: (data: WebsiteAnalysisFormData) => void;
  isLoading: boolean;
};

const DEFAULT_FORM_DATA: WebsiteAnalysisFormData = {
  url: '',
  desktopMobileRatio: 65, // Industry average: 65% desktop, 35% mobile
  interactionLevel: 'default',
  monthlyVisits: 100 // Start with the smallest option
};

const WebsiteAnalysisForm: React.FC<WebsiteAnalysisFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<WebsiteAnalysisFormData>(DEFAULT_FORM_DATA);

  // Check for URL parameters on mount and populate form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Support both 'url' and 'websiteUrl' parameters
    const urlParam = urlParams.get('url') || urlParams.get('websiteUrl');

    if (urlParam) {
      const desktopMobileRatio = parseInt(urlParams.get('desktopMobileRatio') || '65');
      const interactionLevel =
        (urlParams.get('interactionLevel') as 'minimal' | 'default' | 'thorough') || 'default';
      const monthlyVisits = parseInt(urlParams.get('monthlyVisits') || '100');

      setFormData({
        url: urlParam,
        desktopMobileRatio: isNaN(desktopMobileRatio)
          ? 65
          : Math.max(0, Math.min(100, desktopMobileRatio)),
        interactionLevel: ['minimal', 'default', 'thorough'].includes(interactionLevel)
          ? interactionLevel
          : 'default',
        monthlyVisits: isNaN(monthlyVisits) ? 100 : Math.max(1, monthlyVisits)
      });
    }
  }, []);

  // Update URL parameters live as form data changes (debounced for better performance)
  useEffect(() => {
    const updateUrlParams = () => {
      const params = new URLSearchParams();

      // Keep existing tab parameter
      const currentParams = new URLSearchParams(window.location.search);
      const tab = currentParams.get('tab');
      if (tab) {
        params.set('tab', tab);
      }

      // Only add parameters if they differ from defaults or if URL is provided
      if (formData.url) {
        params.set('websiteUrl', formData.url);
      }

      if (formData.desktopMobileRatio !== DEFAULT_FORM_DATA.desktopMobileRatio) {
        params.set('desktopMobileRatio', formData.desktopMobileRatio.toString());
      }

      if (formData.interactionLevel !== DEFAULT_FORM_DATA.interactionLevel) {
        params.set('interactionLevel', formData.interactionLevel);
      }

      if (formData.monthlyVisits !== DEFAULT_FORM_DATA.monthlyVisits) {
        params.set('monthlyVisits', formData.monthlyVisits.toString());
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
      title: 'Light Browsing',
      description: 'Quick visit (1-2 pages), basic scrolling and reading, minimal interactions'
    },
    {
      value: 'default',
      id: 'interactionDefault',
      title: 'Standard Browsing',
      description:
        'Typical visit (3-5 pages), scrolling, hover effects, form interactions, some media'
    },
    {
      value: 'thorough',
      id: 'interactionThorough',
      title: 'Deep Exploration',
      description:
        'Extended session (6+ pages), heavy interactions, media consumption, search usage'
    }
  ];

  const monthlyVisitsOptions = [
    {
      value: '100',
      id: 'visits100',
      title: '100 visits/month',
      description: 'Personal site or small local business'
    },
    {
      value: '1000',
      id: 'visits1k',
      title: '1,000 visits/month',
      description: 'Small personal blog or portfolio'
    },
    {
      value: '10000',
      id: 'visits10k',
      title: '10,000 visits/month',
      description: 'Growing business or popular blog'
    },
    {
      value: '50000',
      id: 'visits50k',
      title: '50,000 visits/month',
      description: 'Established SMB or e-commerce site'
    },
    {
      value: '100000',
      id: 'visits100k',
      title: '100,000 visits/month',
      description: 'Popular website or large business'
    },
    {
      value: '500000',
      id: 'visits500k',
      title: '500,000 visits/month',
      description: 'High-traffic platform or media site'
    },
    {
      value: '1000000',
      id: 'visits1m',
      title: '1,000,000+ visits/month',
      description: 'Enterprise-level or viral content site'
    },
    {
      value: '5000000',
      id: 'visits5m',
      title: '5,000,000+ visits/month',
      description: 'Rockstar'
    }
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof WebsiteAnalysisFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  const formatDesktopMobileRatio = (value: number) => `${value}% Desktop / ${100 - value}% Mobile`;

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Full Website Analysis</h2>
        <p className="text-gray-600">
          Analyze the environmental impact of your entire website based on user behavior patterns,
          device distribution, and monthly traffic
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

        <div className="space-y-8">
          {/* Desktop/Mobile Split */}
          <div>
            <Slider
              label="Device Distribution"
              description="Adjust the split between desktop and mobile users for your website"
              value={formData.desktopMobileRatio}
              onChange={value => handleInputChange('desktopMobileRatio', value)}
              min={0}
              max={100}
              step={5}
              formatValue={formatDesktopMobileRatio}
              recommendation={{
                value: 65,
                label: '65% Desktop (Industry Average)'
              }}
            />
          </div>

          {/* Monthly Visits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Monthly Website Visits
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Choose the option that best represents your website's monthly traffic
            </p>
            <RadioGroup
              options={monthlyVisitsOptions}
              name="monthlyVisits"
              value={formData.monthlyVisits.toString()}
              onChange={e => handleInputChange('monthlyVisits', parseInt(e.target.value))}
              columns={2}
            />
          </div>

          {/* Interaction Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Average User Interaction Level
            </label>
            <RadioGroup
              options={interactionLevelOptions}
              name="interactionLevel"
              value={formData.interactionLevel}
              onChange={e => handleInputChange('interactionLevel', e.target.value)}
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
            Analyze Website
          </Button>
          <Button type="button" variant="secondary" onClick={handleClear} disabled={isLoading}>
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default WebsiteAnalysisForm;
