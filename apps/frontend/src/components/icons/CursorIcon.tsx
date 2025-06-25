import React from 'react';
import { IconProps } from './ReloadIcon';

const CursorIcon: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 14a8 8 0 01-8 8" />
    <path d="M18 11v-1a2 2 0 00-2-2v0a2 2 0 00-2 2v0" />
    <path d="M14 10V9a2 2 0 00-2-2v0a2 2 0 00-2 2v1" />
    <path d="M10 9.5V4a2 2 0 00-2-2v0a2 2 0 00-2 2v10" />
    <path d="M18 11a2 2 0 114 0v3a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 15" />
  </svg>
);

export default CursorIcon;
