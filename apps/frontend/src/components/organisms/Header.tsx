import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-br from-green-600 to-green-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold">Green Web Compass</h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Analyze your website's environmental impact and page weight.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
