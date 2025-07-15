import axios from 'axios';

type GreenWebFoundationHostingResponse = {
  url: string;
  hosted_by?: string;
  hosted_by_website?: string;
  partner?: string | null;
  green: boolean;
  hosted_by_id?: number;
  modified?: string;
  data?: boolean;
  supporting_documents?: Array<{
    id: number;
    title: string;
    link: string;
  }>;
};

export class GreenCheckAPIClient {
  private readonly baseUrl = 'https://api.thegreenwebfoundation.org';
  private readonly timeout = 10000; // 10 seconds timeout
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second between retries

  /**
   * Sleep utility for retry delays
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if a domain is hosted on green servers with timeout and retry logic
   */
  async checkGreenHosting(domain: string): Promise<GreenWebFoundationHostingResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.get<GreenWebFoundationHostingResponse>(
          `${this.baseUrl}/api/v3/greencheck/${domain}`,
          {
            timeout: this.timeout,
            // Add some headers to identify our requests
            headers: {
              'User-Agent': 'Naubion-Backend/1.0',
              Accept: 'application/json'
            }
          }
        );

        if (!response.data) {
          throw new Error(`Green hosting check failed: ${response.statusText}`);
        }

        return response.data;
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries;

        if (axios.isAxiosError(error)) {
          // Handle different types of axios errors
          if (error.code === 'ECONNABORTED') {
            lastError = new Error(
              `Green hosting check timed out after ${this.timeout}ms (attempt ${attempt}/${this.maxRetries})`
            );
          } else if (error.response?.status && error.response.status >= 500) {
            // Server errors - retry
            lastError = new Error(
              `Green hosting check failed: Server error ${error.response.status} (attempt ${attempt}/${this.maxRetries})`
            );
          } else if (
            error.response?.status &&
            error.response.status >= 400 &&
            error.response.status < 500
          ) {
            // Client errors - don't retry
            throw new Error(
              `Green hosting check failed: Client error ${error.response.status} - ${error.message}`
            );
          } else {
            lastError = new Error(
              `Green hosting check failed: ${error.message} (attempt ${attempt}/${this.maxRetries})`
            );
          }
        } else {
          lastError = new Error(
            `Green hosting check failed: ${error instanceof Error ? error.message : 'Unknown error'} (attempt ${attempt}/${this.maxRetries})`
          );
        }

        // If this is the last attempt, throw the error
        if (isLastAttempt) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError!;
  }
}
