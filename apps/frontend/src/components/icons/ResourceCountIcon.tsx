import React from 'react';
import { IconProps } from './ReloadIcon';

const ResourceCountIcon: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
      fill="currentColor"
    />
    <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z" fill="currentColor" />
  </svg>
);

export default ResourceCountIcon;
