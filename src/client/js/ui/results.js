/**
 * Results display UI component
 */

import { copyToClipboard } from '../utils/clipboard.js';

/**
 * Populate and display analysis results
 * @param {Object} data - Analysis results data
 */
export function populateResults(data) {
  const { url, totalSize, sizeByType, resourceCount, resources } = data;

  // Update document title with results
  document.title = `${url} (${totalSize} KB) - Green Web Compass`;

  // Basic metrics
  document.getElementById('analyzedUrl').textContent = url;
  document.getElementById('totalSize').textContent = `${totalSize} KB`;
  document.getElementById('resourceCount').textContent = resourceCount;

  // Count resources by type
  const resourceCounts = getResourceCounts(resources);

  // Update detailed breakdown with file counts, percentages, and averages
  updateBreakdownSection(sizeByType, resourceCounts, totalSize);

  // Populate largest resources
  populateLargestResources(resources);

  // Add share functionality
  setupShareButton();

  // Show results section
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Setup share button functionality
 */
function setupShareButton() {
  const shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;

  // Remove existing listeners by cloning the node
  const newShareBtn = shareBtn.cloneNode(true);
  shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);

  newShareBtn.addEventListener('click', () => {
    const currentUrl = window.location.href;

    copyToClipboard(currentUrl, shareBtn)
      .then(() => {
        newShareBtn.textContent = '✅ Copied!';
        newShareBtn.style.background = 'rgba(16, 185, 129, 0.3)';
        setTimeout(() => {
          newShareBtn.textContent = '📋 Copy Share Link';
          newShareBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        }, 2000);
      })
      .catch(() => {
        newShareBtn.textContent = '❌ Copy failed';
        newShareBtn.style.background = 'rgba(239, 68, 68, 0.3)';
        setTimeout(() => {
          newShareBtn.textContent = '📋 Copy Share Link';
          newShareBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        }, 3000);
      });
  });
}

/**
 * Count resources by type
 * @param {Array} resources - Array of resource objects
 * @returns {Object} Resource counts by type
 */
function getResourceCounts(resources) {
  const resourceCounts = {};
  resources.forEach(resource => {
    const type = resource.type || 'other';
    resourceCounts[type] = (resourceCounts[type] || 0) + 1;
  });
  return resourceCounts;
}

/**
 * Update the breakdown section with resource statistics
 * @param {Object} sizeByType - Size breakdown by type
 * @param {Object} resourceCounts - Resource counts by type
 * @param {number} totalSize - Total page size
 */
function updateBreakdownSection(sizeByType, resourceCounts, totalSize) {
  Object.entries(sizeByType).forEach(([type, size]) => {
    const count = resourceCounts[type] || 0;
    const percentage = totalSize > 0 ? (size / totalSize) * 100 : 0;
    const average = count > 0 ? size / count : 0;

    // Update size and count
    document.getElementById(`${type}Size`).textContent = `${size} KB`;
    document.getElementById(`${type}Count`).textContent = `(${count} files)`;

    // Update progress bar
    document.getElementById(`${type}Progress`).style.width = `${percentage}%`;

    // Update percentage and average
    document.getElementById(`${type}Percentage`).textContent = `${percentage.toFixed(1)}%`;
    document.getElementById(`${type}Average`).textContent = `Avg: ${Math.round(average)} KB`;
  });
}

/**
 * Populate the largest resources section
 * @param {Array} resources - Array of resource objects
 */
function populateLargestResources(resources) {
  const largestResources = resources
    .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
    .slice(0, 5);

  const largestResourcesList = document.getElementById('largestResourcesList');
  largestResourcesList.innerHTML = largestResources
    .map(resource => createLargestResourceHTML(resource))
    .join('');
}

/**
 * Create HTML for a largest resource item
 * @param {Object} resource - Resource object
 * @returns {string} HTML string
 */
function createLargestResourceHTML(resource) {
  return `
    <div class="largest-item">
      <div class="largest-type">${(resource.type || 'other').toUpperCase()}</div>
      <div class="largest-name">${getResourceName(resource.url)}</div>
      <div class="largest-size">${formatSize(resource.transferSize)}</div>
    </div>
  `;
}

/**
 * Get a display name for a resource from its URL
 * @param {string} url - Resource URL
 * @returns {string} Display name
 */
function getResourceName(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop();
    return fileName || urlObj.hostname;
  } catch (e) {
    return url.length > 50 ? `${url.substring(0, 50)}...` : url;
  }
}

/**
 * Format a size in bytes as KB or MB string
 * @param {number} size - Size in bytes
 * @returns {string} Formatted size string
 */
function formatSize(size) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(size / 1024).toFixed(1)} KB`;
}
