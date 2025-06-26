import React from 'react';
import { IconProps } from './ReloadIcon';

const InfoIcon: React.FC<IconProps> = ({ width = 16, height = 16, className }) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path d="M12 16v-4" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 8h.01" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default InfoIcon;
