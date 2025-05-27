/**
 * Analysis service - handles page weight analysis business logic
 * Refactored with better configuration management and error handling
 */

import { getPageWeight } from '../../analysis/processing/page-weight.js';
import { getConfig } from '../../config/index.js';
import logger from '../../utils/logger.js';
import { AnalysisError, TimeoutError } from '../../utils/errors.js';

/**
 * Helper function to determine resource type
 * @param {string} url - Resource URL
 * @param {string} contentType - Resource content type
 * @returns {string} Resource type
 */
function determineResourceType(url, contentType) {
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
 * Analyze a URL and return processed results
 * @param {string} url - URL to analyze
 * @param {Object} options - Analysis options
 * @param {string} options.interactionLevel - Level of user interaction simulation
 * @param {string} options.deviceType - Type of device to simulate
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeUrl(url, options = {}) {
  const { interactionLevel = 'default', deviceType = 'desktop' } = options;

  logger.info(`Starting analysis for: ${url}`, { interactionLevel, deviceType });

  const analysisTimeout = getConfig('analysis.timeout');
  const startTime = Date.now();

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(`Analysis timed out after ${analysisTimeout}ms`, analysisTimeout));
      }, analysisTimeout);
    });

    // Race between analysis and timeout
    const analysisPromise = getPageWeight(url, {
      interactionLevel,
      deviceType,
      progressCallback: progress => {
        logger.progress('Analysis progress', progress);
      }
    });

    const rawResults = await Promise.race([analysisPromise, timeoutPromise]);

    const duration = Date.now() - startTime;
    logger.success(`Analysis completed in ${duration}ms`, { url, duration });

    // Process resources to add the 'type' field for frontend compatibility
    const resourcesWithType = rawResults.resources.map(resource => {
      const resourceType =
        rawResults.resourceProcessor?.determineResourceType(resource.url, resource.contentType) ||
        determineResourceType(resource.url, resource.contentType);

      return {
        ...resource,
        type: resourceType,
        resourceType
      };
    });

    // Transform the result to match the frontend expectations
    const results = {
      url,
      timestamp: new Date().toISOString(),
      analysisOptions: { interactionLevel, deviceType },
      totalTransferSize: rawResults.totalTransferSize,
      totalSize: Math.round(rawResults.totalTransferSize / 1024), // KB
      sizeByType: {
        html: Math.round(rawResults.sizeByType.html / 1024),
        css: Math.round(rawResults.sizeByType.css / 1024),
        js: Math.round(rawResults.sizeByType.js / 1024),
        media: Math.round(rawResults.sizeByType.media / 1024),
        font: Math.round(rawResults.sizeByType.font / 1024),
        other: Math.round(rawResults.sizeByType.other / 1024)
      },
      resourceCount: rawResults.resourceCount || rawResults.resources.length,
      resources: resourcesWithType,
      metadata: {
        analysisTime: duration,
        version: '1.0.0'
      }
    };

    return results;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof TimeoutError) {
      logger.error(`Analysis timed out after ${duration}ms`, { url, timeout: analysisTimeout });
      throw error;
    }

    logger.error(`Analysis failed after ${duration}ms`, {
      url,
      error: error.message,
      duration
    });

    throw new AnalysisError(`Analysis failed: ${error.message}`, url);
  }
}
