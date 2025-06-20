import React from 'react';
import { Footer, Header } from '../';

type MainLayoutProps = {
  className?: string;
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className="bg-background-light text-text-dark text-sm">
      <Header />
      <main className={className}>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
