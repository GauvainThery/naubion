import React from 'react';
import { cn } from '../../utils/classnames';

type AlertProps = {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  className?: string;
};

const Alert: React.FC<AlertProps> = ({ children, variant = 'info', onClose, className = '' }) => {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border transition-all duration-200',
        variants[variant],
        className
      )}
    >
      <span className="text-lg font-semibold">{icons[variant]}</span>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
