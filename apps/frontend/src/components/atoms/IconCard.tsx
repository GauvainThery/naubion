import { cn } from './../../utils/classnames';
import React from 'react';
import {
  MagnifyingGlassIcon,
  CodeIcon,
  ChartsIcon,
  SheetIcon,
  ThumbIcon,
  ServerIcon,
  EarthIcon,
  CarIcon,
  CursorIcon
} from '../icons';

export type IconCardProps = {
  title: string;
  description: string;
  icon:
    | 'magnifyingGlass'
    | 'code'
    | 'charts'
    | 'sheet'
    | 'thumb'
    | 'servers'
    | 'earth'
    | 'car'
    | 'cursor';
  className?: string;
};

const IconCard: React.FC<IconCardProps> = ({
  title,
  description,
  icon,
  className = '',
  ...props
}) => {
  const icons: Record<IconCardProps['icon'], React.ReactNode> = {
    magnifyingGlass: <MagnifyingGlassIcon className="w-6 h-6" />,
    code: <CodeIcon className="w-6 h-6" />,
    charts: <ChartsIcon className="w-6 h-6" />,
    sheet: <SheetIcon className="w-6 h-6" />,
    thumb: <ThumbIcon className="w-6 h-6" />,
    servers: <ServerIcon className="w-6 h-6" />,
    earth: <EarthIcon className="w-6 h-6" />,
    car: <CarIcon className="w-6 h-6" />,
    cursor: <CursorIcon className="w-6 h-6" />
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
        <h3 className="text-text-light font-semibold text-center">{title}</h3>
        <p className="text-text-secondary-light text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default IconCard;
