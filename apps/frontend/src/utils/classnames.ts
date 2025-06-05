import { ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  // always ensure to complete this list when you add a font size in tailwind.config.js
  extend: {
    classGroups: {}
  }
});

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
