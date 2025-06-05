import React from 'react';
import ResourceItem from '../atoms/ResourceItem';

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
    <div className={className}>
      <h4 className="text-lg font-semibold text-gray-900 mb-6">{title}</h4>
      <div className="space-y-3">
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
