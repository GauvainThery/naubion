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
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  name,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
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
