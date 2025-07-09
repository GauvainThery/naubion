import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/classnames';

type TextInputWithSubmitProps = {
  placeholder?: string;
  buttonText?: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email';
  required?: boolean;
  error?: string | null;
  success?: boolean;
  successMessage?: string;
};

const TextInputWithSubmit: React.FC<TextInputWithSubmitProps> = ({
  placeholder,
  buttonText,
  onSubmit,
  disabled = false,
  loading = false,
  className = '',
  value: controlledValue,
  onChange,
  type = 'text',
  required = false,
  error = null,
  success = false,
  successMessage
}) => {
  const { t } = useTranslation('common');
  const [internalValue, setInternalValue] = useState('');

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Use translation defaults if not provided
  const defaultPlaceholder = placeholder ?? t('forms.placeholders.enterText');
  const defaultButtonText = buttonText ?? t('buttons.submit');
  const defaultSuccessMessage = successMessage ?? t('messages.success');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled && !loading) {
      onSubmit(value.trim());
    }
  };

  const isSubmitDisabled = disabled || loading || !value.trim() || (required && !value.trim());

  return (
    <div className={cn(className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white rounded-full focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 transition-colors duration-200 drop-shadow hover:shadow-md">
          <input
            type={type}
            value={value}
            onChange={handleInputChange}
            placeholder={defaultPlaceholder}
            disabled={disabled || success}
            required={required}
            className="flex-1 px-4 py-3 bg-transparent border-none outline-none placeholder-gray-400 text-gray-900 rounded-l-full disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitDisabled || success}
            className={cn(
              'px-6 py-3 bg-primary text-text-light font-medium rounded-full transition-all duration-200',
              'hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2',
              loading && 'cursor-wait',
              success && 'bg-utils-100 hover:bg-utils-100'
            )}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {success && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            <span className={loading ? 'opacity-70' : ''}>
              {success ? t('newsletter.subscribed') : defaultButtonText}
            </span>
          </button>
        </div>
      </form>

      {success && (
        <div className="mt-2 text-sm text-primary text-center">{defaultSuccessMessage}</div>
      )}

      {error && <div className="mt-2 text-sm text-utils-700 text-center">{error}</div>}
    </div>
  );
};

export default TextInputWithSubmit;
