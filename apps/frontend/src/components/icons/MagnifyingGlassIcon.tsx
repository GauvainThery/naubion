import React from 'react';
import { IconProps } from './ReloadIcon';

const MagnifyingGlassIcon: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export default MagnifyingGlassIcon;
