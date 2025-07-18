import { NewsletterResponse } from '@naubion/shared';

export const subscribeToNewsletter = async (
  email: string,
  name?: string,
  country?: string
): Promise<NewsletterResponse> => {
  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, name, country })
    });

    const data: NewsletterResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to subscribe to newsletter');
    }

    return data;
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw error;
  }
};
