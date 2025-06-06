import React from 'react';
import { cn } from '../../utils/classnames';

type TabOption = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
};

type TabsProps = {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const Tabs: React.FC<TabsProps> = ({ options, value, onChange, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-center w-full justify-center cursor-pointer py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                value === option.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              <div className="text-left">
                <div>{option.label}</div>
                {option.description && (
                  <div className="text-xs font-normal text-gray-400 mt-1">{option.description}</div>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Tabs;
