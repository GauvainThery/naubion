import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('analysis');

  if (!resources || resources.length === 0) {
    return null;
  }

  // Function to get translated resource type name
  const getTranslatedResourceType = (type: string): string => {
    const typeKey = type.toLowerCase();
    const translationKey = `results.resourceTypes.${typeKey}`;
    const translated = t(translationKey);

    // If translation key doesn't exist, return the original type
    return translated === translationKey ? type : translated;
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-center lg:text-left">
          {t('results.sections.resourceList.title')}
        </h4>
        <p className="text-text-secondary lg:w-7/8">
          {t('results.sections.resourceList.description')}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {resources.map((resource, index) => (
          <ResourceItem
            key={index}
            name={resource.name}
            type={getTranslatedResourceType(resource.type)}
            size={resource.size}
          />
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
