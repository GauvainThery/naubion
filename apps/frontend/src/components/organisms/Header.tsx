import React from 'react';
import { Button, Logo } from '..';
import { Link } from 'react-router';
import { page } from '@naubion/shared';

type HeaderProps = {
  currentPage: keyof typeof page;
};

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const navigationLinks: Record<keyof typeof page, [string, string]> = {
    home: [page.pageCarbonFootprint, 'Estimate your web page carbon footprint'],
    pageCarbonFootprint: [page.home, 'Join the waitlist!'],
    admin: [page.home, 'ADmin']
  };

  return (
    <header className="flex justify-between items-center py-6 max-w-8xl mx-auto px-3 sm:px-5 lg:px-7 pt-24 lg:pt-10">
      <div className="lg:w-1/3" />

      <div className="lg:w-1/3 flex flex-col items-center justify-center gap-3 text-center">
        <Link to={page.home}>
          <Logo size="lg" hasDropShadow className="lg:block hidden" />

          {/* Mobile logo */}
          <Logo size="md" hasDropShadow className="lg:hidden" />
        </Link>
        <p className="font-bold text-xs">Control the environmental impact of your application</p>
      </div>

      <div className="lg:w-1/3 flex items-center justify-end">
        <Link className="hidden fixed lg:block z-20" to={navigationLinks[currentPage][0]}>
          <Button>{navigationLinks[currentPage][1]}</Button>
        </Link>
      </div>

      {/* Mobile Link */}
      <Link
        className="w-4/5 fixed top-4 left-4 lg:hidden z-20"
        to={navigationLinks[currentPage][0]}
      >
        <Button>{navigationLinks[currentPage][1]}</Button>
      </Link>
    </header>
  );
};

export default Header;
