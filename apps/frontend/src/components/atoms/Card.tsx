import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
