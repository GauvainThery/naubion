import React from 'react';
import ResourceItem from '../atoms/ResourceItem';
import { cn } from './../../utils/classnames';

type LargestResource = {
  name: string;
  type: string;
  size: string;
};

type ResourceListProps = {
  title: string;
  resources: LargestResource[];
  className?: string;
};

const ResourceList: React.FC<ResourceListProps> = ({ title, resources, className = '' }) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <h4 className="text-lg font-semibold">{title}</h4>
      <div className="flex flex-col gap-4">
        {resources.map((resource, index) => (
          <ResourceItem
            key={index}
            name={resource.name}
            type={resource.type}
            size={resource.size}
          />
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
