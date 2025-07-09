import React from 'react';
import { Trans } from 'react-i18next';
import LanguageSwitcher from '../molecules/LanguageSwitcher';

const Footer = () => {
  return (
    <footer className="flex flex-col justify-center items-center pt-32 pb-12 container gap-8">
      <p className="text-text-secondary">
        <Trans
          i18nKey="footer.madeSustainably"
          ns="common"
          components={[
            <span className="text-primary" />,
            <span className="text-primary" />,
            <span className="text-red-500" />
          ]}
        />
      </p>
      <LanguageSwitcher />
    </footer>
  );
};

export default Footer;
