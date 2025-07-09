import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { cn } from '../../utils/classnames';
import { LANGUAGE_CONFIGS } from '../../utils/i18n';

type LanguageSwitcherProps = {
  className?: string;
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { currentLanguage, changeLanguage, isChanging } = useLanguage();

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="group"
      aria-label="Language selector"
    >
      {LANGUAGE_CONFIGS.map(lang => {
        const isActive = currentLanguage.startsWith(lang.code);

        return (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            disabled={isChanging}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 hover:cursor-pointer',
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm',
              isChanging && 'opacity-50 cursor-not-allowed'
            )}
            title={`Switch to ${lang.nativeName}`}
            aria-label={`Switch to ${lang.nativeName}`}
            aria-pressed={isActive}
          >
            <span role="img" aria-label={`${lang.name} flag`}>
              {lang.flag}
            </span>
            <span className="hidden sm:inline font-medium">{lang.code.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
