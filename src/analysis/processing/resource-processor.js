/**
 * Resource processing module
 * Handles analysis and categorization of collected network resources
 */

export class ResourceProcessor {
  constructor() {
    this.sizeByType = {
      html: 0,
      css: 0,
      js: 0,
      media: 0,
      font: 0,
      other: 0
    };
  }

  /**
   * Process collected resources and categorize them
   */
  processResources(resources) {
    // Reset counters
    this.resetCounters();

    // Map for tracking processed resources to avoid duplicates
    const processedUrls = new Set();
    const successfulUrls = new Set();
    let totalTransferSize = 0;

    // Process each resource
    for (const resource of resources) {
      // Skip if already processed (some resources might be reported multiple times)
      if (processedUrls.has(resource.url)) continue;
      processedUrls.add(resource.url);

      // Skip failed requests
      if (resource.status >= 400) continue;

      const { url, contentType, transferSize } = resource;
      successfulUrls.add(url);

      // Add to total sizes
      totalTransferSize += transferSize;

      // Determine and categorize resource type
      const resourceType = this.determineResourceType(url, contentType);
      this.sizeByType[resourceType] += transferSize;

      // Log details in development
      this.logResourceDetails(url, contentType, resourceType, transferSize);
    }

    return {
      totalTransferSize,
      sizeByType: { ...this.sizeByType },
      processedCount: successfulUrls.size
    };
  }

  /**
   * Determine the type of a resource based on URL and content type
   */
  determineResourceType(url, contentType) {
    // Extract file extension from URL
    const fileExtension = url.split('?')[0].split('#')[0].split('.').pop().toLowerCase();

    // Special handling for favicon
    if (url.includes('favicon.ico') || fileExtension === 'ico') {
      return 'media';
    }

    // Determine resource type based on content type and file extension
    if (contentType.includes('text/html')) {
      return 'html';
    } else if (contentType.includes('text/css') || fileExtension === 'css') {
      return 'css';
    } else if (
      contentType.includes('javascript') ||
      contentType.includes('text/javascript') ||
      fileExtension === 'js'
    ) {
      return 'js';
    } else if (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('model/') ||
      [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'svg',
        'webp',
        'ico',
        'bmp',
        'mp4',
        'webm',
        'avi',
        'mov',
        'mp3',
        'wav',
        'ogg',
        'm4a',
        'flac',
        'glb',
        'gltf',
        'obj',
        'fbx',
        '3ds',
        'dae',
        'ply',
        'stl',
        'x3d',
        'blend'
      ].includes(fileExtension)
    ) {
      return 'media';
    } else if (
      contentType.includes('font/') ||
      contentType.includes('application/font') ||
      ['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(fileExtension)
    ) {
      return 'font';
    }

    return 'other';
  }

  /**
   * Log detailed information about a resource
   */
  logResourceDetails(url, contentType, resourceType, transferSize) {
    console.log(`Resource: ${url}`);
    console.log(`  Content-Type: ${contentType}`);
    console.log(`  Resource Type: ${resourceType}`);
    console.log(`  Transfer Size: ${transferSize} bytes (${(transferSize / 1024).toFixed(2)} KB)`);
    console.log('---');
  }

  /**
   * Log summary of processed resources
   */
  logSummary(results) {
    const { totalTransferSize, sizeByType, processedCount } = results;
    const totalTransferSizeKB = totalTransferSize / 1024;

    console.log('\n--- RESOURCE ANALYSIS SUMMARY ---');
    console.log(`Total resources processed: ${processedCount}`);
    console.log(
      `Total transferred size: ${totalTransferSize} bytes (${totalTransferSizeKB.toFixed(2)} KB)`
    );
    console.log('');

    // Log size by type
    for (const [type, size] of Object.entries(sizeByType)) {
      const percentage =
        totalTransferSize > 0 ? ((size / totalTransferSize) * 100).toFixed(1) : '0';
      console.log(
        `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } size: ${size} bytes (${(size / 1024).toFixed(2)} KB) - ${percentage}%`
      );
    }
    console.log('');
  }

  /**
   * Reset internal counters
   */
  resetCounters() {
    this.sizeByType = {
      html: 0,
      css: 0,
      js: 0,
      media: 0,
      font: 0,
      other: 0
    };
  }

  /**
   * Get resource breakdown by type
   */
  getSizeByType() {
    return { ...this.sizeByType };
  }
}
