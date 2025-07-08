import React from 'react';
import { IconProps } from './ReloadIcon';

const WarningIcon: React.FC<IconProps> = ({ width = 16, height = 16, className }) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      strokeWidth="2"
    />
    <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default WarningIcon;
