import React, { useState, useEffect } from 'react';
import Tabs from '../atoms/Tabs';
import AnalysisForm from './AnalysisForm';
import WebsiteAnalysisForm from './WebsiteAnalysisForm';
import type { AnalysisFormData, WebsiteAnalysisFormData, AnalysisType } from '../../types';

type CombinedAnalysisFormProps = {
  onSubmit: (data: AnalysisFormData | WebsiteAnalysisFormData, type: AnalysisType) => void;
  isLoading: boolean;
};

const CombinedAnalysisForm: React.FC<CombinedAnalysisFormProps> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<AnalysisType>('page');

  // Check for tab parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') as AnalysisType;

    if (tabParam && ['page', 'website'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Update URL parameter when tab changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (activeTab !== 'page') {
      params.set('tab', activeTab);
    } else {
      params.delete('tab');
    }

    // Update the URL without causing a page reload
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [activeTab]);

  const tabOptions = [
    {
      value: 'page',
      label: 'Single Page',
      description: 'Analyze one page',
      icon: (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
            clipRule="evenodd"
          />
        </svg>
      )
    },
    {
      value: 'website',
      label: 'Full Website',
      description: 'Analyze entire site',
      icon: (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.029 11H4.083a6.004 6.004 0 002.783 4.118z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
  ];

  const handlePageAnalysisSubmit = (data: AnalysisFormData) => {
    onSubmit(data, 'page');
  };

  const handleWebsiteAnalysisSubmit = (data: WebsiteAnalysisFormData) => {
    onSubmit(data, 'website');
  };

  return (
    <div className="space-y-6">
      <Tabs
        options={tabOptions}
        value={activeTab}
        onChange={value => setActiveTab(value as AnalysisType)}
      />

      {activeTab === 'page' && (
        <AnalysisForm onSubmit={handlePageAnalysisSubmit} isLoading={isLoading} />
      )}

      {activeTab === 'website' && (
        <WebsiteAnalysisForm onSubmit={handleWebsiteAnalysisSubmit} isLoading={isLoading} />
      )}
    </div>
  );
};

export default CombinedAnalysisForm;
