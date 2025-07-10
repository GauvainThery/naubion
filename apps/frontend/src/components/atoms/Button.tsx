import React from 'react';
import { cn } from './../../utils/classnames';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-primary',
    secondary:
      'border-2 bg-utils-700/5 border-utils-700 text-utils-700 rounded-lg drop-shadow-none focus:ring-utils-700 focus:ring-1',
    outline: 'bg-primary' // Not yet implemented
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'drop-shadow text-text-light hover:cursor-pointer hover:contrast-125 py-3 px-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-md',
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      <span
        className={cn(
          'w-full flex gap-3 justify-center items-center text-center',
          loading ? 'opacity-0' : ''
        )}
      >
        {children}
      </span>
    </button>
  );
};

export default Button;
