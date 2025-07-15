import React from 'react';

type InputProps = {
  label?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  min?: string;
  max?: string;
  icon?: React.ReactNode;
  id?: string;
  ariaDescribedBy?: string;
};

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  min,
  max,
  className = '',
  icon,
  id,
  ariaDescribedBy,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;

  const baseClasses =
    'w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-colors duration-200 placeholder-gray-text-secondary focus:outline-primary';

  return (
    <div className="relative w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : ariaDescribedBy}
        className={`${baseClasses} ${icon ? 'pr-12' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {icon && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary">
          {icon}
        </div>
      )}
      {error && (
        <div id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
