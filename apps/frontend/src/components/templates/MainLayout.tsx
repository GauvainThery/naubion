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
      <main className={className}>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
