import React from 'react';
import Header from '../organisms/Header';

type MainLayoutProps = {
  className?: string;
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className="bg-background-light text-text-dark text-sm">
      <div className="noise" />
      <Header />
      <main className={className}>{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-16"></footer>
    </div>
  );
};

export default MainLayout;
