import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ReloadIcon } from '../';

const TryAnotherPageSection: React.FC = () => {
  const { t } = useTranslation('analysis');

  const handleTryAnother = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="w-full flex justify-center">
      <Button
        className="flex flex-row gap-3 w-full lg:w-1/3 justify-center"
        onClick={handleTryAnother}
      >
        <p>{t('results.tryAnotherPage')}</p>
        <div>
          <ReloadIcon />
        </div>
      </Button>
    </div>
  );
};

export default TryAnotherPageSection;
