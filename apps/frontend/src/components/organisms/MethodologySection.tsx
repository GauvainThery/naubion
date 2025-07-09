import React from 'react';
import { useTranslation } from 'react-i18next';
import IconCard, { IconCardProps } from '../atoms/IconCard';
import { cn } from './../../utils/classnames';

type MethodologySectionProps = {
  className?: string;
};

const MethodologySection: React.FC<MethodologySectionProps> = ({ className }) => {
  const { t } = useTranslation('analysis');

  const methodologySteps: {
    title: string;
    description: string;
    icon: Pick<IconCardProps, 'icon'>['icon'];
  }[] = [
    {
      title: t('methodology.steps.resourceCollection.title'),
      description: t('methodology.steps.resourceCollection.description'),
      icon: 'code'
    },
    {
      title: t('methodology.steps.interactionSimulation.title'),
      description: t('methodology.steps.interactionSimulation.description'),
      icon: 'cursor'
    },
    {
      title: t('methodology.steps.greenHostingAssessment.title'),
      description: t('methodology.steps.greenHostingAssessment.description'),
      icon: 'servers'
    },
    {
      title: t('methodology.steps.co2eCalculation.title'),
      description: t('methodology.steps.co2eCalculation.description'),
      icon: 'earth'
    },
    {
      title: t('methodology.steps.realWorldImpact.title'),
      description: t('methodology.steps.realWorldImpact.description'),
      icon: 'car'
    }
  ];

  return (
    <section
      className={cn(
        'noise bg-primary border-t-4 border-green-950 text-text-light pb-16 relative drop-shadow-2xl',
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

      <div className="container">
        <div className="flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-light mb-4">{t('methodology.title')}</h2>
            <p className="text-text-secondary-light max-w-3xl mx-auto">
              {t('methodology.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-18 lg:gap-24">
            {methodologySteps.map((step, index) => (
              <IconCard
                key={index}
                title={step.title}
                description={step.description}
                icon={step.icon}
                className="text-justify"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;
