import React from 'react';
import { IconProps } from './ReloadIcon';

const SearchIcon: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 2C5.13 2 2 5.13 2 9C2 12.87 5.13 16 9 16C12.87 16 16 12.87 16 9C16 5.13 12.87 2 9 2ZM9 14C6.24 14 4 11.76 4 9C4 6.24 6.24 4 9 4C11.76 4 14 6.24 14 9C14 11.76 11.76 14 9 14Z"
      fill="currentColor"
    />
    <path d="M15.5 14.5L19 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default SearchIcon;
