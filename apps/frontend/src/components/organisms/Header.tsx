import { page } from '@naubion/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button, Logo } from '..';

type HeaderProps = {
  currentPage: keyof typeof page;
};

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const { t } = useTranslation('common');

  const navigationLinks: Record<keyof typeof page, [string, string]> = {
    home: [page.pageCarbonFootprint, t('nav.analyzePage')],
    pageCarbonFootprint: [page.home, t('nav.home')],
    admin: [page.home, t('nav.admin')]
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
        <p className="font-bold text-xs">{t('tagline')}</p>
      </div>

      <div className="lg:w-1/3 flex items-center justify-end gap-4">
        <Link className="hidden fixed lg:block z-20" to={navigationLinks[currentPage][0]}>
          <Button>{navigationLinks[currentPage][1]}</Button>
        </Link>
      </div>

      {/* Mobile Link */}
      <div className="w-[calc(100%-32px)] fixed top-4 left-4 lg:hidden z-20">
        <Link to={navigationLinks[currentPage][0]}>
          <Button>{navigationLinks[currentPage][1]}</Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
