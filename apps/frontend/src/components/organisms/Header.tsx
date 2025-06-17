import React from 'react';
import { Button, Logo } from '..';
import { Link } from 'react-router';
import { page } from '@naubion/shared';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center py-6 container pt-24 lg:pt-6">
      <div className="lg:w-1/3" />

      <div className="lg:w-1/3 flex flex-col items-center justify-center gap-3 text-center">
        <Link to={page.home}>
          <Logo size="lg" hasDropShadow className="lg:block hidden" />

          {/* Mobile logo */}
          <Logo size="md" hasDropShadow className="lg:hidden" />
        </Link>
        <p className="font-bold">Control the web environmental footprint</p>
      </div>

      <div className="lg:w-1/3 flex items-center justify-end">
        <Link className="hidden fixed lg:block z-20" to={page.pageCarbonFootprint}>
          <Button>Measure one page's carbon footprint</Button>
        </Link>
      </div>

      {/* Mobile Link */}
      <Link className="fixed top-4 left-4 lg:hidden z-20" to={page.pageCarbonFootprint}>
        <Button>Measure one page's carbon footprint</Button>
      </Link>
    </header>
  );
};

export default Header;
