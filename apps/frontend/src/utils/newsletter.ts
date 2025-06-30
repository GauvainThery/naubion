import { NewsletterResponse } from '@naubion/shared';

const API_BASE_URL = '/api';

export const subscribeToNewsletter = async (
  email: string,
  name?: string
): Promise<NewsletterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, name })
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
