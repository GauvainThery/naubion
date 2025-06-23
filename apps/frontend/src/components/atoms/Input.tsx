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
};

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  min,
  max,
  className = '',
  icon,
  ...props
}) => {
  const baseClasses =
    'w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-colors duration-200 placeholder-gray-text-secondary focus:outline-primary';

  return (
    <div className="relative w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        className={`${baseClasses} ${icon ? 'pr-12' : ''} ${className}`}
        {...props}
      />
      {icon && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary">
          {icon}
        </div>
      )}
    </div>
  );
};

export default Input;
