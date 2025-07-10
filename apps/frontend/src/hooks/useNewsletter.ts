import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { i18n } = useTranslation();

  const subscribe = async (email: string, name?: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Map language to country for Mailjet
      const country = i18n.language === 'fr' ? 'FR' : 'EN';

      await subscribeToNewsletter(email, name, country);
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
