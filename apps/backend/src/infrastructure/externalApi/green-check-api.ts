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

  /**
   * Check if a domain is hosted on green servers
   */
  async checkGreenHosting(domain: string): Promise<GreenWebFoundationHostingResponse> {
    try {
      const response = await axios.get<GreenWebFoundationHostingResponse>(
        `${this.baseUrl}/api/v3/greencheck/${domain}`
      );

      if (!response.data) {
        throw new Error(`Green hosting check failed: ${response.statusText}`);
      }

      const data = response.data;

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Green hosting check failed: ${error.response?.status} - ${error.message}`);
      } else {
        throw new Error(
          `Green hosting check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }
}
