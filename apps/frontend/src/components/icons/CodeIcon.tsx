import React from 'react';
import { IconProps } from './ReloadIcon';

const CodeIcon: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
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
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);

export default CodeIcon;
