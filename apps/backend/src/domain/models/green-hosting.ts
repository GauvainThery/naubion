export interface GreenHostingResult {
  url: string;
  green: boolean;
  duration: number;
  data?: GreenHostingData;
}

export interface GreenHostingData {
  hosted_by?: string;
  hosted_by_website?: string;
  supporting_documents?: Array<{
    id: number;
    title: string;
    link: string;
  }>;
}
