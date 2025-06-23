import { cn } from './../../utils/classnames';
import React from 'react';

type RadioOptionProps = {
  name: string;
  value: string;
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  description?: string;
  className?: string;
};

const RadioOption: React.FC<RadioOptionProps> = ({
  name,
  value,
  id,
  checked,
  onChange,
  title,
  description,
  className = ''
}) => {
  return (
    <label
      className={cn(
        'flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-utils-200 transition-colors',
        checked ? 'border-utils-200 bg-utils-200/5' : '',
        className
      )}
    >
      <div className="flex items-center h-6">
        <input
          type="radio"
          name={name}
          value={value}
          id={id}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-utils-200 border-gray-300 focus:ring-utils-100 focus:ring-offset-0"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-medium text-gray-900">{title}</div>
        {description && <div className="text-sm text-text-secondary">{description}</div>}
      </div>
    </label>
  );
};

export default RadioOption;
