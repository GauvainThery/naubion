import React from 'react';
import RadioOption from '../atoms/RadioOption';

type RadioGroupProps = {
  name: string;
  options: Array<{
    value: string;
    id: string;
    title: string;
    description?: string;
  }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  columns?: 1 | 2;
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  name,
  value,
  onChange,
  className = '',
  columns = 1
}) => {
  const containerClass =
    columns === 2 ? `grid grid-cols-1 md:grid-cols-2 gap-3 ${className}` : `space-y-3 ${className}`;

  return (
    <div className={containerClass}>
      {options.map(option => (
        <RadioOption
          key={option.value}
          name={name}
          value={option.value}
          id={option.id}
          checked={value === option.value}
          onChange={onChange}
          title={option.title}
          description={option.description}
        />
      ))}
    </div>
  );
};

export default RadioGroup;
