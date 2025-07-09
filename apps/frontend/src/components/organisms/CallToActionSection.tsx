import { TextInputWithSubmit } from '../';
import { useNewsletter } from '../../hooks/useNewsletter';
import { useTranslation } from 'react-i18next';
import { cn } from './../../utils/classnames';

type CallToActionSectionProps = {
  className?: string;
  subtitle: string;
};

const CallToActionSection = ({ className, subtitle }: CallToActionSectionProps) => {
  const { subscribe, isLoading, error, success } = useNewsletter();
  const { t } = useTranslation('cta');

  const handleEmailSubmit = async (email: string) => {
    await subscribe(email);
    console.log('Email submitted:', email);
  };

  return (
    <section className={cn(className)}>
      <div className="container flex flex-col gap-18 relative z-10">
        <div className="w-full flex justify-center items-center">
          <div className="flex flex-col gap-3 max-w-2xl text-center">
            <h2 className="text-2xl font-bold">{t('title')}</h2>
            <p className="text-text-secondary">{subtitle}</p>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <TextInputWithSubmit
            type="email"
            className="w-auto min-w-[330px]"
            placeholder={t('hero:emailPlaceholder')}
            buttonText={t('button')}
            onSubmit={handleEmailSubmit}
            loading={isLoading}
            error={error}
            success={success}
            successMessage={t('hero:successMessage')}
            required
          />
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
