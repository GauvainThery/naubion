import { useState } from 'react';
import { subscribeToNewsletter } from '../utils/newsletter';

interface UseNewsletterReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  subscribe: (email: string, name?: string) => Promise<void>;
  reset: () => void;
}

export const useNewsletter = (): UseNewsletterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const subscribe = async (email: string, name?: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await subscribeToNewsletter(email, name);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to newsletter';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    success,
    subscribe,
    reset
  };
};
