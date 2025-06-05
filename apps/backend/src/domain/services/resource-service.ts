/**
 * Resource domain service - Core business logic for processing web resources
 */

import {
  Resource,
  ResourceCollection,
  ResourceSizeBreakdown,
  determineResourceType
} from '../models/resource.js';
import logger from '../../shared/logger.js';

export class ResourceService {
  /**
   * Process collected resources and categorize them
   */
  processResources(
    rawResources: {
      url: string;
      transferSize: number;
      contentType: string;
      status: number;
    }[]
  ): ResourceCollection {
    // Initialize size breakdown
    const sizeByType: ResourceSizeBreakdown = {
      html: 0,
      css: 0,
      js: 0,
      media: 0,
      font: 0,
      other: 0
    };

    // Map for tracking processed resources to avoid duplicates
    const processedUrls = new Set<string>();
    const resources: Resource[] = [];
    let totalTransferSize = 0;

    // Process each resource
    for (const rawResource of rawResources) {
      // Skip if already processed (some resources might be reported multiple times)
      if (processedUrls.has(rawResource.url)) {
        continue;
      }
      processedUrls.add(rawResource.url);

      // Skip failed requests
      if (rawResource.status >= 400) {
        continue;
      }

      const { url, contentType, transferSize } = rawResource;

      // Add to total sizes
      totalTransferSize += transferSize;

      // Determine resource type
      const resourceType = determineResourceType(url, contentType);

      // Categorize by type
      sizeByType[resourceType] += transferSize;

      // Create domain entity
      const resource: Resource = {
        ...rawResource,
        resourceType
      };

      resources.push(resource);
    }

    // Log summary in development mode
    this.logSummary({
      totalTransferSize,
      sizeByType,
      resources,
      resourceCount: resources.length
    });

    return {
      totalTransferSize,
      sizeByType,
      resources,
      resourceCount: resources.length
    };
  }

  /**
   * Log summary of processed resources
   */
  private logSummary(collection: ResourceCollection): void {
    const { totalTransferSize, sizeByType, resourceCount } = collection;
    const totalTransferSizeKB = totalTransferSize / 1024;

    logger.debug('--- RESOURCE ANALYSIS SUMMARY ---');
    logger.debug(`Total resources processed: ${resourceCount}`);
    logger.debug(
      `Total transferred size: ${totalTransferSize} bytes (${totalTransferSizeKB.toFixed(2)} KB)`
    );

    // Log size by type
    for (const [type, size] of Object.entries(sizeByType)) {
      const percentage =
        totalTransferSize > 0 ? ((size / totalTransferSize) * 100).toFixed(1) : '0';
      logger.debug(
        `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } size: ${size} bytes (${(size / 1024).toFixed(2)} KB) - ${percentage}%`
      );
    }
  }
}
