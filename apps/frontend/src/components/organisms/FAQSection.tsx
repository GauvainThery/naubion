import React from 'react';
import { useTranslation } from 'react-i18next';
import FAQItem from '../atoms/FAQItem';
import { cn } from './../../utils/classnames';

type FAQSectionProps = {
  className?: string;
};

const FAQSection: React.FC<FAQSectionProps> = ({ className }) => {
  const { t } = useTranslation('analysis');

  const faqs = [
    {
      question: t('faq.items.isThisNaubion.question'),
      answer: t('faq.items.isThisNaubion.answer')
    },
    {
      question: t('faq.items.accuracy.question'),
      answer: t('faq.items.accuracy.answer')
    },
    {
      question: t('faq.items.interactionLevels.question'),
      answer: t('faq.items.interactionLevels.answer')
    },
    {
      question: t('faq.items.greenHosting.question'),
      answer: t('faq.items.greenHosting.answer')
    },
    {
      question: t('faq.items.carEquivalent.question'),
      answer: t('faq.items.carEquivalent.answer')
    },
    {
      question: t('faq.items.resourcesIncluded.question'),
      answer: t('faq.items.resourcesIncluded.answer')
    },
    {
      question: t('faq.items.authentication.question'),
      answer: t('faq.items.authentication.answer')
    },
    {
      question: t('faq.items.desktopVsMobile.question'),
      answer: t('faq.items.desktopVsMobile.answer')
    },
    {
      question: t('faq.items.caching.question'),
      answer: t('faq.items.caching.answer')
    }
  ];

  return (
    <section className={cn('container', className)}>
      <div className="flex flex-col gap-12">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-bold">{t('faq.title')}</h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
