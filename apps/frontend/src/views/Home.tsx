import React from 'react';
import { CallToActionSection, FeatureSection, HeroSection, MainLayout } from '../components';

const Home: React.FC = () => {
  return (
    <MainLayout currentPage="home" className="flex flex-col">
      <HeroSection />
      <FeatureSection />
      <CallToActionSection />
    </MainLayout>
  );
};

export default Home;
