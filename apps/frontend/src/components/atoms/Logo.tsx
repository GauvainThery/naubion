import { cn } from '../../utils/classnames';

type LogoProps = {
  size: 'sm' | 'md' | 'lg';
  hasDropShadow?: boolean;
  className?: string;
};

const Logo = ({ size = 'md', className = '', hasDropShadow = false }: LogoProps) => {
  const sizes: Record<LogoProps['size'], string> = {
    sm: 'w-[100px]',
    md: 'w-[256px]',
    lg: 'w-[296px]'
  };

  return (
    <img
      src="assets/naubion-logo.svg"
      alt="naubion logo"
      className={cn(sizes[size], hasDropShadow ? 'drop-shadow' : '', className)}
    />
  );
};

export default Logo;
