import { useLanguage } from './../../hooks/useLanguage';
import { page } from '@naubion/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { cn } from '../../utils/classnames';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

type PageCarbonAnalyzerIntroProps = {
  className?: string;
};

const PageCarbonAnalyzerIntro: React.FC<PageCarbonAnalyzerIntroProps> = ({ className }) => {
  const { t } = useTranslation('page-carbon-analyzer');

  const { currentLanguage } = useLanguage();

  return (
    <div className={cn('flex flex-col-reverse w-full lg:flex-row gap-16 items-center', className)}>
      {/* Demo Image */}
      <div className="relative w-full flex justify-center items-center">
        <img
          src={`/assets/demo_${currentLanguage}.png`}
          alt="Screenshot of the page carbon analyzer interface showing key metrics including page weight, resource count, and environmental impact analysis"
          className=" h-auto rounded-xl shadow-lg border-4 border-primary w-full max-w-[650px]"
        />
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-8 w-full">
        <div className="flex flex-col gap-4">
          <div className="w-fit px-3 py-1 bg-primary/10 text-primary font-medium text-xs rounded-full">
            {t('intro.subtitle')}
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-dark leading-tight">
            {t('intro.title')}
          </h2>
          <p className="text-text-secondary leading-relaxed">{t('intro.description')}</p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-text-dark">{t('intro.keyFeatures')}</h3>
          <ul className="flex flex-col gap-3">
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 self-start translate-y-1.5"></div>
              <span className="text-text-secondary">{t('intro.features.realTime')}</span>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 self-start translate-y-1.5"></div>
              <span className="text-text-secondary">{t('intro.features.detailed')}</span>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 self-start translate-y-1.5"></div>
              <span className="text-text-secondary">{t('intro.features.hosting')}</span>
            </li>
          </ul>
        </div>

        <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-text-dark">{t('intro.readyToExplore')}</h4>
              <p className="text-sm text-text-secondary">{t('intro.startAnalyzing')}</p>
            </div>
            <div className="flex-shrink-0">
              <Button variant="primary" size="md">
                <Link to={page.pageCarbonFootprint} preventScrollReset={false}>
                  {t('intro.cta')}
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PageCarbonAnalyzerIntro;
