import { Page } from '@naubion/shared';
import React from 'react';
import { Footer, Header } from '../';

type MainLayoutProps = {
  className?: string;
  children: React.ReactNode;
  currentPage: Page;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, className }) => {
  return (
    <div className="bg-background-light text-text-dark text-sm">
      <Header currentPage={currentPage} />
      <main id="main-content" className={className} role="main" aria-label="Main content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
