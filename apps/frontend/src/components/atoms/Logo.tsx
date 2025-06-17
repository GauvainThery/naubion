import { cn } from '../../utils/classnames';

type LogoProps = {
  size: 'sm' | 'md' | 'lg';
  hasDropShadow?: boolean;
  className?: string;
};

const Logo = ({ size = 'md', className = '', hasDropShadow = false }: LogoProps) => {
  const sizes: Record<LogoProps['size'], string> = {
    sm: 'w-[100px]',
    md: 'w-[150px]',
    lg: 'w-[221px]'
  };

  return (
    <img
      src="assets/naubion-logo.svg"
      alt="naubion logo"
      className={cn(
        sizes[size],
        hasDropShadow ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]' : '',
        className
      )}
    />
  );
};

export default Logo;
