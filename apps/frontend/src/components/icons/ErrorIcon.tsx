import React from 'react';
import { IconProps } from './ReloadIcon';

const ErrorIcon: React.FC<IconProps> = ({ width = 16, height = 16, className }) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round" />
    <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default ErrorIcon;
