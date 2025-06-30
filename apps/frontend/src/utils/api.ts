/**
 * Get the full API URL for a given endpoint
 * Uses VITE_API_URL environment variable if available, otherwise falls back to relative paths
 */
export const getApiUrl = (endpoint: string): string => {
  // Access Vite environment variables
  const baseUrl = import.meta.env?.VITE_API_URL || '';

  if (baseUrl) {
    return `${baseUrl}${endpoint}`;
  }

  // Fallback to relative path for dev server proxy
  return endpoint;
};
