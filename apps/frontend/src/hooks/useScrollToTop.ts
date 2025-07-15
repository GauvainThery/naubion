import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const useScrollToTop = (
  behavior: 'auto' | 'smooth' = 'auto',
  element: HTMLElement | Window = window
): void => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when location changes (new page navigation)
    if (element instanceof HTMLElement) {
      element.scrollTo({ top: 0, behavior });
    } else if (element instanceof Window) {
      element.scrollTo({ top: 0, behavior });
    }
  }, [location.pathname, location.search, behavior, element]);
};

export default useScrollToTop;
