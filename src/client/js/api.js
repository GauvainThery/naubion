/**
 * API communication module
 */

/**
 * Analyze a URL using the backend API
 * @param {string|Object} urlOrOptions - URL to analyze or options object
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeUrl(urlOrOptions) {
  // Support both old string format and new options object
  let requestBody;

  if (typeof urlOrOptions === 'string') {
    // Legacy string format - maintain backward compatibility
    requestBody = { url: urlOrOptions };
  } else {
    // New options object format
    requestBody = urlOrOptions;
  }

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
