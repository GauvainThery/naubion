/**
 * Cross-origin request handler - Handles orphaned cross-origin requests
 * Infrastructure layer component for Chrome DevTools Protocol integration
 */

import { Resource } from '../../domain/models/resource.js';
import { CrossOriginResourceFetcher } from './cross-origin-resource-fetcher.js';
import logger from '../../shared/logger.js';

interface NetworkRequest {
  requestId: string;
  url: string;
  method: string;
  timestamp: number;
  isSameSite?: boolean;
}

interface ActivityNotifier {
  notifyActivity: (
    type: string,
    data: {
      url?: string;
      type?: string;
      size?: number;
    }
  ) => void;
}

export class CrossOriginRequestHandler {
  private crossOriginFetcher: CrossOriginResourceFetcher;
  private activityNotifier: ActivityNotifier;
  private existingResources: Resource[] = [];

  constructor(crossOriginFetcher: CrossOriginResourceFetcher, activityNotifier: ActivityNotifier) {
    this.crossOriginFetcher = crossOriginFetcher;
    this.activityNotifier = activityNotifier;
  }

  /**
   * Update the reference to existing resources to avoid duplicates
   */
  updateExistingResources(resources: Resource[]): void {
    this.existingResources = resources;
  }

  /**
   * Process any pending cross-origin requests before closing
   * This should be called before the page closes to handle orphaned requests
   */
  async processPendingRequests(requests: Map<string, NetworkRequest>): Promise<Resource[]> {
    const pendingCrossOriginRequests = Array.from(requests.values()).filter(
      request => request.isSameSite === false
    );

    if (pendingCrossOriginRequests.length === 0) {
      logger.debug('No pending cross-origin requests to process');
      return [];
    }

    logger.debug(`Processing ${pendingCrossOriginRequests.length} pending cross-origin requests`);

    const processPromises = pendingCrossOriginRequests.map(request =>
      this.handleOrphanedRequest(request.requestId, request)
    );

    const results = await Promise.allSettled(processPromises);
    const newResources: Resource[] = [];

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        newResources.push(result.value);
      }
    });

    // Add sub-resources from cross-origin fetching
    const subResources = this.crossOriginFetcher.getSubResources();
    newResources.push(...subResources);

    logger.debug('Finished processing pending cross-origin requests');
    return newResources;
  }

  /**
   * Handle orphaned cross-origin requests by recursively fetching them
   * This follows the cross-origin URL to get real resource information
   */
  private async handleOrphanedRequest(
    requestId: string,
    request: NetworkRequest
  ): Promise<Resource | null> {
    // Check if we already processed this URL to avoid infinite recursion
    if (this.existingResources.some(r => r.url === request.url)) {
      logger.debug('Cross-origin request already processed as resource', {
        requestId,
        url: request.url
      });
      return null;
    }

    // No response - recursively fetch the URL to get real data and all sub-resources
    logger.debug('No response for cross-origin request - fetching recursively', {
      requestId,
      url: request.url
    });

    try {
      const fetchedResource = await this.crossOriginFetcher.fetchResource(request.url);
      if (fetchedResource) {
        this.activityNotifier.notifyActivity('finished', {
          url: fetchedResource.url,
          type: fetchedResource.resourceType,
          size: fetchedResource.transferSize
        });

        logger.debug('Successfully fetched cross-origin resource recursively', {
          requestId,
          url: fetchedResource.url,
          status: fetchedResource.status,
          size: fetchedResource.transferSize
        });

        return fetchedResource;
      }
    } catch (error) {
      logger.warn('Failed to fetch cross-origin resource recursively', {
        requestId,
        url: request.url,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return null;
  }
}
