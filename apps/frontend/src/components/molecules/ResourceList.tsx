import React from 'react';
import ResourceItem from '../atoms/ResourceItem';
import { cn } from './../../utils/classnames';

type LargestResource = {
  name: string;
  type: string;
  size: string;
};

type ResourceListProps = {
  resources: LargestResource[];
  className?: string;
};

const ResourceList: React.FC<ResourceListProps> = ({ resources, className = '' }) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-center lg:text-left">Largest Resources</h4>
        <p className="text-text-secondary lg:w-7/8">
          The largest resources loaded by the page. These resources can significantly impact the
          page's performance and loading time. Consider optimizing or reducing their size to improve
          user experience.
        </p>
      </div>
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
