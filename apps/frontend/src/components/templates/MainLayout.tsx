import React from 'react';
import Header from '../organisms/Header';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="h-[2000px] bg-background-light text-text-dark text-sm noise">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-16"></footer>
    </div>
  );
};

export default MainLayout;
