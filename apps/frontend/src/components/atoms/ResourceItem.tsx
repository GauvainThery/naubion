import React from 'react';

type ResourceItemProps = {
  name: string;
  type: string;
  size: string;
  className?: string;
};

const ResourceItem: React.FC<ResourceItemProps> = ({ name, type, size, className = '' }) => {
  return (
    <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl ${className}`}>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{name}</div>
        <div className="text-sm text-gray-500">{type}</div>
      </div>
      <div className="text-right ml-4">
        <div className="font-semibold text-gray-900">{size}</div>
      </div>
    </div>
  );
};

export default ResourceItem;
