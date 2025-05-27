/**
 * URL parameter handling utilities
 */

/**
 * Get a URL parameter value by name
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value or null if not found
 */
export function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Update or remove a URL parameter
 * @param {string} name - Parameter name
 * @param {string|null} value - Parameter value (null to remove)
 */
export function updateUrlParameter(name, value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(name, value);
  } else {
    url.searchParams.delete(name);
  }
  window.history.pushState({ path: url.href }, '', url.href);
}

/**
 * Check if URL has analysis parameters and initialize page accordingly
 */
export function initializeFromUrlParams() {
  // Support multiple parameter names for flexibility
  const urlParam =
    getUrlParameter('url') ||
    getUrlParameter('site') ||
    getUrlParameter('website') ||
    getUrlParameter('analyze');

  if (!urlParam) return null;

  // Auto-correct URL if it doesn't have protocol
  let correctedUrl = urlParam;
  if (!urlParam.startsWith('http://') && !urlParam.startsWith('https://')) {
    correctedUrl = `https://${urlParam}`;
  }

  return correctedUrl;
}
