import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CallToActionSection,
  FeatureSection,
  HeroSection,
  MainLayout,
  PageCarbonAnalyzerSection
} from '../components';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { useScrollToTop } from '../hooks/useScrollToTop';

const Home: React.FC = () => {
  const { t } = useTranslation('cta');

  useSEO(PAGE_SEO.home);

  // Automatically scroll to top when navigating to this page
  useScrollToTop();

  return (
    <MainLayout currentPage="home" className="flex flex-col gap-32">
      <HeroSection className="pt-24 -mb-32" />
      <FeatureSection className="pt-24 pb-12" />
      <PageCarbonAnalyzerSection className="pt-24" />
      <CallToActionSection subtitle={t('subtitle')} className="pt-4" />
    </MainLayout>
  );
};

export default Home;
