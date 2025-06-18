import React from 'react';
import { FeatureSection, HeroSection, MainLayout } from '../components';

const Home: React.FC = () => {
  return (
    <MainLayout className="flex flex-col gap-28">
      <HeroSection />
      <FeatureSection />
      <div className="h-36" />
    </MainLayout>
  );
};

export default Home;
