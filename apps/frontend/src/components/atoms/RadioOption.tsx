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
      className={`flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 transition-colors ${checked ? 'border-green-500 bg-green-50' : ''} ${className}`}
    >
      <div className="flex items-center h-6">
        <input
          type="radio"
          name={name}
          value={value}
          id={id}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-offset-0"
        />
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
      </div>
    </label>
  );
};

export default RadioOption;
