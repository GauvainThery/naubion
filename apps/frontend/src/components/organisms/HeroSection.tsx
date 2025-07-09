import { Laptop, TextInputWithSubmit } from '../';
import { useNewsletter } from '../../hooks/useNewsletter';
import { useTranslation } from 'react-i18next';
import { cn } from './../../utils/classnames';

type HeroSectionProps = {
  className?: string;
};

const HeroSection = ({ className }: HeroSectionProps) => {
  const { subscribe, isLoading, error, success } = useNewsletter();
  const { t } = useTranslation('hero');

  const handleEmailSubmit = async (email: string) => {
    await subscribe(email);
  };

  return (
    <section
      className={cn(
        'flex flex-col lg:flex-row items-center justify-between container gap-12',
        className
      )}
    >
      <div className="lg:w-1/2 flex flex-col gap-8 lg:gap-16 lg:pb-28 h-[312px] lg:h-[496px]">
        <div className="flex flex-col gap-3 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold">{t('title')}</h1>
          <p className="text-text-secondary lg:w-7/8">{t('subtitle')}</p>
        </div>

        <div className="flex flex-col gap-6 text-center justify-center items-center w-full">
          <p className="secondary-font">
            <strong>naubion</strong> {t('comingSoon')}
          </p>
          <TextInputWithSubmit
            type="email"
            placeholder={t('emailPlaceholder')}
            className="w-auto min-w-[330px]"
            buttonText={t('common:buttons.join')}
            onSubmit={handleEmailSubmit}
            loading={isLoading}
            error={error}
            success={success}
            successMessage={t('successMessage')}
            required
          />
        </div>
      </div>
      <div className="lg:w-1/2 w-full h-full flex justify-center items-end mt-18 sm:mt-0">
        <Laptop />
      </div>
    </section>
  );
};

export default HeroSection;
