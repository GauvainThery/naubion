/**
 * Cross-origin resource fetcher - Handles fetching cross-origin resources
 * Infrastructure layer component for Chrome DevTools Protocol integration
 */

import { Page, CDPSession } from 'puppeteer';
import { Resource } from '../../domain/models/resource.js';
import { determineResourceType } from '../../domain/models/resource.js';
import logger from '../../shared/logger.js';

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

export class CrossOriginResourceFetcher {
  private page: Page;
  private activityNotifier: ActivityNotifier;
  private resources: Resource[] = [];

  constructor(page: Page, activityNotifier: ActivityNotifier) {
    this.page = page;
    this.activityNotifier = activityNotifier;
  }

  /**
   * Fetch a cross-origin resource by opening it as a new page
   * This captures all resources loaded from the cross-origin page
   */
  async fetchResource(url: string): Promise<Resource | null> {
    try {
      // Create a new page for this specific request
      const browser = this.page.browser();
      const newPage = await browser.newPage();

      // Set up a mini network monitor for this page to capture all resources
      const cdpSession = await newPage.createCDPSession();
      await cdpSession.send('Network.enable');

      const pageResources: Map<string, Partial<Resource>> = new Map();
      const mainResourceData: Partial<Resource> = { url };

      // Track all requests and responses from this page
      this.setupNetworkListeners(cdpSession, pageResources, mainResourceData, url);

      // Navigate to the URL with a timeout
      await newPage.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 10000 // 10 second timeout
      });

      // Wait a bit more for network events to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Close the page to clean up resources
      await newPage.close();

      // Return the main resource if we got valid data
      if (mainResourceData.status && mainResourceData.contentType) {
        const mainResource = this.createMainResource(mainResourceData, url);

        logger.debug('Returning main cross-origin resource', {
          url: mainResource.url,
          size: mainResource.transferSize,
          status: mainResource.status,
          type: mainResource.resourceType
        });

        return mainResource;
      }

      return null;
    } catch (error) {
      logger.debug('Error during recursive cross-origin fetch', {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Get all sub-resources found during cross-origin fetching
   */
  getSubResources(): Resource[] {
    return [...this.resources];
  }

  /**
   * Reset the internal resources array
   */
  reset(): void {
    this.resources = [];
  }

  private setupNetworkListeners(
    cdpSession: CDPSession,
    pageResources: Map<string, Partial<Resource>>,
    mainResourceData: Partial<Resource>,
    mainUrl: string
  ): void {
    // Track all requests
    cdpSession.on(
      'Network.requestWillBeSent',
      (params: { requestId: string; request: { url: string; method: string } }) => {
        pageResources.set(params.requestId, {
          url: params.request.url
        });
      }
    );

    // Track all responses
    cdpSession.on(
      'Network.responseReceived',
      (params: {
        requestId: string;
        response: {
          url: string;
          status: number;
          headers: Record<string, string>;
          mimeType?: string;
        };
      }) => {
        this.handleResponseReceived(params, pageResources, mainResourceData, mainUrl);
      }
    );

    // Track loading finished events
    cdpSession.on(
      'Network.loadingFinished',
      (params: { requestId: string; encodedDataLength?: number }) => {
        this.handleLoadingFinished(params, pageResources, mainResourceData, mainUrl);
      }
    );
  }

  private handleResponseReceived(
    params: {
      requestId: string;
      response: {
        url: string;
        status: number;
        headers: Record<string, string>;
        mimeType?: string;
      };
    },
    pageResources: Map<string, Partial<Resource>>,
    mainResourceData: Partial<Resource>,
    mainUrl: string
  ): void {
    const resource = pageResources.get(params.requestId);
    if (resource) {
      resource.status = params.response.status;
      resource.contentType =
        params.response.headers['content-type'] ||
        params.response.mimeType ||
        'application/octet-stream';
      resource.resourceType = determineResourceType(params.response.url, resource.contentType);

      // Try to get size from Content-Length header as fallback
      const contentLength = params.response.headers['content-length'];
      if (contentLength && !isNaN(parseInt(contentLength))) {
        resource.transferSize = parseInt(contentLength);
      }
    }

    // Track the main resource separately
    if (params.response.url === mainUrl) {
      this.updateMainResourceData(params, mainResourceData, mainUrl);
    }
  }

  private updateMainResourceData(
    params: {
      response: {
        status: number;
        headers: Record<string, string>;
        mimeType?: string;
      };
    },
    mainResourceData: Partial<Resource>,
    mainUrl: string
  ): void {
    mainResourceData.status = params.response.status;
    mainResourceData.contentType =
      params.response.headers['content-type'] ||
      params.response.mimeType ||
      'application/octet-stream';
    mainResourceData.resourceType = determineResourceType(mainUrl, mainResourceData.contentType);

    // Try to get size from Content-Length header for main resource too
    const contentLength = params.response.headers['content-length'];
    if (contentLength && !isNaN(parseInt(contentLength))) {
      mainResourceData.transferSize = parseInt(contentLength);
    }
  }

  private handleLoadingFinished(
    params: { requestId: string; encodedDataLength?: number },
    pageResources: Map<string, Partial<Resource>>,
    mainResourceData: Partial<Resource>,
    mainUrl: string
  ): void {
    const resource = pageResources.get(params.requestId);
    if (resource) {
      // Set the transfer size with a minimum of 1 byte for successful resources
      resource.transferSize = Math.max(params.encodedDataLength || 0, 1);

      // Add completed resource to main resources array if it's valid
      if (resource.status && resource.contentType && resource.url) {
        const completeResource = this.createCompleteResource(resource);

        // Only add if we don't already have this resource
        if (!this.resources.some(r => r.url === completeResource.url)) {
          this.resources.push(completeResource);
          this.activityNotifier.notifyActivity('finished', {
            url: completeResource.url,
            type: completeResource.resourceType,
            size: completeResource.transferSize
          });

          logger.debug('Added cross-origin sub-resource', {
            url: completeResource.url,
            type: completeResource.resourceType,
            size: completeResource.transferSize
          });
        }
      }
    }

    // Update main resource transfer size
    if (pageResources.get(params.requestId)?.url === mainUrl) {
      mainResourceData.transferSize = Math.max(params.encodedDataLength || 0, 1);
    }
  }

  private createCompleteResource(resource: Partial<Resource>): Resource {
    return {
      url: resource.url!,
      contentType: resource.contentType!,
      transferSize: resource.transferSize!,
      status: resource.status!,
      resourceType:
        resource.resourceType || determineResourceType(resource.url!, resource.contentType!)
    };
  }

  private createMainResource(mainResourceData: Partial<Resource>, url: string): Resource {
    return {
      url: mainResourceData.url!,
      contentType: mainResourceData.contentType!,
      transferSize: Math.max(mainResourceData.transferSize || 0, 1), // Ensure minimum size
      status: mainResourceData.status!,
      resourceType:
        mainResourceData.resourceType || determineResourceType(url, mainResourceData.contentType!)
    };
  }
}
