import { cn } from './../../utils/classnames';
import React, { useState } from 'react';
import Divider from './Divider';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen = false, onToggle }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const isExpanded = onToggle ? isOpen : internalIsOpen;

  return (
    <div
      className={cn(
        'rounded-xl bg-white focus:outline-none drop-shadow',
        isExpanded ? 'ring-2 ring-primary ring-offset-2' : ''
      )}
    >
      <button
        className={cn(
          'w-full px-6 py-4 text-left focus:outline-none rounded-xl hover:cursor-pointer',
          isExpanded ? '' : 'focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-md font-semibold pr-4">{question}</h3>
          <div className="flex-shrink-0">
            <svg
              className={`w-5 h-5 text-text-secondary transition-transform duration-400 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <>
          <Divider />
          <div className="px-6 py-4">
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">{answer}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default FAQItem;
