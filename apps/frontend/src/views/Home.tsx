import React from 'react';
import { CallToActionSection, FeatureSection, HeroSection, MainLayout } from '../components';

const Home: React.FC = () => {
  return (
    <MainLayout currentPage="home" className="flex flex-col gap-32">
      <HeroSection className="pt-24 -mb-32" />
      <FeatureSection className="pt-24 pb-12" />
      <CallToActionSection className="pt-12" />
    </MainLayout>
  );
};

export default Home;
