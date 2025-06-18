import React from 'react';
import { CallToActionSection, FeatureSection, HeroSection, MainLayout } from '../components';

const Home: React.FC = () => {
  return (
    <MainLayout className="flex flex-col gap-28">
      <HeroSection />
      <FeatureSection />
      <CallToActionSection />
    </MainLayout>
  );
};

export default Home;
