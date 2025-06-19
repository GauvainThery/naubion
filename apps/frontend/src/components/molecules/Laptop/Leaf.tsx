interface LeafProps {
  direction: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Leaf = ({ direction, size = 'medium', className = '' }: LeafProps) => {
  const sizeClasses = {
    small: 'w-3 h-5',
    medium: 'w-4 h-6',
    large: 'w-5 h-8'
  };

  const rotationClass = direction === 'left' ? '-rotate-[35deg] scale-x-[-1]' : 'rotate-[35deg]';

  return (
    <div className={`relative ${className}`}>
      {/* Main leaf body */}
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-green-400 via-green-500 to-green-700 transform ${rotationClass} origin-bottom relative`}
        style={{
          clipPath: 'xywh(0 5px 100% 75% round 45% 0)',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
        }}
      >
        {/* Central vein following the leaf's natural curve */}
        <div className="absolute top-[15px] left-[6px] w-[0.5px] h-[12px] bg-green-800 opacity-40 rotate-[35deg]" />

        {/* Natural highlight */}
        <div className="absolute top-1 left-1 w-1.5 h-2 bg-green-300 opacity-30 rounded-full blur-[1px]" />
      </div>
    </div>
  );
};

export default Leaf;
