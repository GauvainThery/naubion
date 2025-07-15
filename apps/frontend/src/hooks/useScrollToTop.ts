import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const useScrollToTop = (
  behavior: 'auto' | 'smooth' = 'smooth',
  element: HTMLElement | Window = window
): void => {
  const location = useLocation();

  useEffect(() => {
    // Wait for content to load and then scroll
    const scrollToTop = () => {
      element.scrollTo({ top: 0, behavior });
    };

    // Use setTimeout to ensure scroll happens after the current call stack
    // and any pending DOM updates
    const timeoutId = setTimeout(scrollToTop, 0);

    // Also listen for the window load event to handle cases where
    // images and other resources are still loading
    const handleLoad = () => {
      element.scrollTo({ top: 0, behavior: 'auto' });
    };

    // Only add the load listener if we're dealing with the window
    if (element === window) {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timeoutId);
      if (element === window) {
        window.removeEventListener('load', handleLoad);
      }
    };
  }, [location.pathname, location.search, behavior, element]);
};

export default useScrollToTop;
