import React, { useState } from 'react';

type TooltipProps = {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
};

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <>
          {/* Mobile tooltip - always appears above and spans most of the width */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 sm:hidden">
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs max-w-xs mx-auto whitespace-normal">
              {content}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
          </div>

          {/* Desktop tooltip - follows the position prop */}
          <div
            className={`absolute z-50 hidden w-md sm:block ${
              position === 'top'
                ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
                : position === 'bottom'
                  ? 'top-full mt-2 left-1/2 transform -translate-x-1/2'
                  : position === 'left'
                    ? 'right-full mr-2 top-1/2 transform -translate-y-1/2'
                    : 'left-full ml-2 top-1/2 transform -translate-y-1/2'
            }`}
          >
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg drop-shadow text-xs">
              {content}
            </div>
            <div
              className={`absolute w-0 h-0 border-4 ${
                position === 'top'
                  ? 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900'
                  : position === 'bottom'
                    ? 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900'
                    : position === 'left'
                      ? 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900'
                      : 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
              }`}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Tooltip;
