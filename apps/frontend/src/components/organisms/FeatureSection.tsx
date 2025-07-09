import { IconCard } from '../';
import { useTranslation } from 'react-i18next';
import { cn } from './../../utils/classnames';

type FeatureSectionProps = {
  className?: string;
};

const FeatureSection = ({ className }: FeatureSectionProps) => {
  const { t } = useTranslation('features');

  return (
    <section
      className={cn(
        'noise bg-primary border-t-4 border-green-950 text-text-light relative drop-shadow-2xl',
        className
      )}
    >
      <div className="grass" />
      {/* Curved bottom */}
      <div
        className="absolute -bottom-24 left-0 w-full h-24 bg-primary noise"
        style={{
          clipPath: 'ellipse(100% 100% at 00% 0%)'
        }}
      />

      <div className="container flex flex-col gap-18 lg:gap-24 relative z-10">
        <div className="w-full flex justify-center items-center">
          <div className="flex flex-col gap-3 max-w-2xl text-center">
            <h2 className="text-2xl font-bold">{t('title')}</h2>
            <p className="text-text-secondary-light">{t('subtitle')}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-18 lg:gap-24">
          <IconCard
            icon="code"
            description={t('cards.easyImplementation.description')}
            title={t('cards.easyImplementation.title')}
          />

          <IconCard
            icon="magnifyingGlass"
            description={t('cards.monitoring.description')}
            title={t('cards.monitoring.title')}
          />

          <IconCard
            icon="charts"
            description={t('cards.reduce.description')}
            title={t('cards.reduce.title')}
          />

          <IconCard
            icon="sheet"
            description={t('cards.report.description')}
            title={t('cards.report.title')}
          />

          <IconCard
            icon="thumb"
            description={t('cards.communicate.description')}
            title={t('cards.communicate.title')}
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
