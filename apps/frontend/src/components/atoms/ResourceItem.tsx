import { cn } from './../../utils/classnames';
import React from 'react';

type ResourceItemProps = {
  name: string;
  type: string;
  size: string;
  className?: string;
};

const ResourceItem: React.FC<ResourceItemProps> = ({ name, type, size, className = '' }) => {
  return (
    <div className={cn('flex items-center justify-between p-4 bg-gray-50 rounded-xl', className)}>
      <div className="flex-1 overflow-hidden">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-text-secondary">{type}</div>
      </div>
      <div className="text-right ml-4">
        <div className="font-semibold">{size}</div>
      </div>
    </div>
  );
};

export default ResourceItem;
