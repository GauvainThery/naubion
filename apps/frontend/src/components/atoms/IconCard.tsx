import { cn } from './../../utils/classnames';
import React from 'react';

type IconCardProps = {
  title: string;
  description: string;
  icon: 'magnifyingGlass' | 'code' | 'charts' | 'sheet' | 'thumb';
  className?: string;
};

const magnifyingGlassIcon = (
  <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const codeIcon = (
  <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);

const chartsIcon = (
  <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const sheetIcon = (
  <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const thumbIcon = (
  <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
    />
  </svg>
);

const IconCard: React.FC<IconCardProps> = ({
  title,
  description,
  icon,
  className = '',
  ...props
}) => {
  const icons: Record<IconCardProps['icon'], React.ReactNode> = {
    magnifyingGlass: magnifyingGlassIcon,
    code: codeIcon,
    charts: chartsIcon,
    sheet: sheetIcon,
    thumb: thumbIcon
  };
  return (
    <div
      className={cn('w-80 text-center flex flex-col justify-start items-center gap-4', className)}
      {...props}
    >
      <div className="rounded-full bg-background-light p-2 drop-shadow text-primary-500">
        {icons[icon]}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-text-light font-semibold">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default IconCard;
