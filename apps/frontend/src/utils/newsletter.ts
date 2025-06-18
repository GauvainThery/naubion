const API_BASE_URL = '/api';

export interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
}

export const subscribeToNewsletter = async (
  email: string,
  name?: string
): Promise<NewsletterSubscriptionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, name })
    });

    const data: NewsletterSubscriptionResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to subscribe to newsletter');
    }

    return data;
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw error;
  }
};
