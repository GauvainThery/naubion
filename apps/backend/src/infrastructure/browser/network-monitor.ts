/**
 * Network monitoring infrastructure - Chrome DevTools Protocol integration
 */

import { CDPSession, Page } from 'puppeteer';
import { Resource } from '../../domain/models/resource.js';
import { determineResourceType } from '../../domain/models/resource.js';
import { CrossOriginResourceFetcher } from './cross-origin-resource-fetcher.js';
import { CrossOriginRequestHandler } from './cross-origin-request-handler.js';
import logger from '../../shared/logger.js';

interface NetworkEvent {
  requestId: string;
  url: string;
  method: string;
  timestamp: number;
  isSameSite?: boolean;
}

interface ResponseEvent extends NetworkEvent {
  status: number;
  headers: Record<string, string>;
  contentType: string;
}

interface LoadingFinishedEvent {
  requestId: string;
  timestamp: number;
  encodedDataLength: number;
}

export class NetworkMonitor {
  private client: CDPSession;
  private page?: Page;
  private resources: Resource[] = [];
  private requests: Map<string, NetworkEvent & { isSameSite?: boolean }> = new Map();
  private responses: Map<string, ResponseEvent> = new Map();
  private isMonitoring = false;
  private activityListeners: Array<
    (
      type: string,
      data: {
        requestId?: string;
        url?: string;
        method?: string;
        status?: number;
        type?: string;
        size?: number;
      }
    ) => void
  > = [];
  private lastActivity = Date.now();
  private crossOriginFetcher?: CrossOriginResourceFetcher;
  private crossOriginHandler?: CrossOriginRequestHandler;

  constructor(client: CDPSession, page?: Page) {
    this.client = client;
    this.page = page;

    // Initialize cross-origin handling if page is available
    if (this.page) {
      this.crossOriginFetcher = new CrossOriginResourceFetcher(this.page, {
        notifyActivity: this.notifyActivity.bind(this)
      });
      this.crossOriginHandler = new CrossOriginRequestHandler(this.crossOriginFetcher, {
        notifyActivity: this.notifyActivity.bind(this)
      });
    }
  }

  /**
   * Set up network monitoring listeners
   */
  async setupListeners(): Promise<void> {
    await this.client.send('Network.enable');
    await this.client.send('Runtime.enable');

    this.client.on('Network.requestWillBeSent', this.handleRequestWillBeSent.bind(this));
    this.client.on('Network.responseReceived', this.handleResponseReceived.bind(this));
    this.client.on('Network.loadingFinished', this.handleLoadingFinished.bind(this));
    this.client.on('Network.loadingFailed', this.handleLoadingFailed.bind(this));

    this.isMonitoring = true;
    logger.debug('Network monitoring enabled with enhanced cross-origin support');
  }

  /**
   * Handle request will be sent event
   */
  private handleRequestWillBeSent(params: {
    requestId: string;
    request: { url: string; method: string; isSameSite?: boolean };
    timestamp: number;
    type?: string;
    redirectResponse?: unknown;
    initiator?: unknown;
  }): void {
    const { requestId, request } = params;

    this.requests.set(requestId, {
      requestId,
      url: request.url,
      method: request.method,
      timestamp: params.timestamp,
      isSameSite: request.isSameSite
    });

    this.notifyActivity('request', { requestId, url: request.url, method: request.method });
  }

  /**
   * Handle response received event
   */
  private handleResponseReceived(params: {
    requestId: string;
    response: { url: string; status: number; headers: Record<string, string>; mimeType?: string };
    timestamp: number;
  }): void {
    const { requestId, response } = params;

    this.responses.set(requestId, {
      requestId,
      url: response.url,
      method: 'GET',
      timestamp: params.timestamp,
      status: response.status,
      headers: response.headers,
      contentType: response.headers['content-type'] || response.mimeType || 'unknown'
    });

    this.notifyActivity('response', { requestId, url: response.url, status: response.status });
  }

  /**
   * Handle loading finished event
   */
  private handleLoadingFinished(params: LoadingFinishedEvent): void {
    const { requestId, encodedDataLength } = params;
    const request = this.requests.get(requestId);
    const response = this.responses.get(requestId);

    if (request && response) {
      const resource: Resource = {
        url: response.url,
        contentType: response.contentType,
        transferSize: encodedDataLength,
        status: response.status,
        resourceType: determineResourceType(response.url, response.contentType)
      };

      this.resources.push(resource);
      this.notifyActivity('finished', {
        url: resource.url,
        type: resource.resourceType,
        size: resource.transferSize
      });
    }

    // Clean up maps to prevent memory leaks
    this.requests.delete(requestId);
    this.responses.delete(requestId);
  }

  /**
   * Handle loading failed event
   */
  private handleLoadingFailed(params: {
    requestId: string;
    errorText: string;
    timestamp: number;
    canceled?: boolean;
  }): void {
    const { requestId } = params;
    this.requests.delete(requestId);
    this.responses.delete(requestId);
    logger.debug('Resource loading failed', { requestId });
  }

  /**
   * Process any pending cross-origin requests before closing
   * This should be called before the page closes to handle orphaned requests
   */
  async processPendingCrossOriginRequests(): Promise<void> {
    if (!this.crossOriginHandler) {
      logger.debug('No cross-origin handler available - skipping pending requests');
      return;
    }

    // Update handler with current resources to avoid duplicates
    this.crossOriginHandler.updateExistingResources(this.resources);

    // Process pending requests and add new resources
    const newResources = await this.crossOriginHandler.processPendingRequests(this.requests);
    this.resources.push(...newResources);

    logger.debug('Finished processing pending cross-origin requests');
  }

  /**
   * Clean up request/response maps
   */
  private cleanup(requestId: string): void {
    this.requests.delete(requestId);
    this.responses.delete(requestId);
  }

  /**
   * Register activity listener
   */
  onActivity(
    callback: (
      type: string,
      data: {
        requestId?: string;
        url?: string;
        method?: string;
        status?: number;
        type?: string;
        size?: number;
      }
    ) => void
  ): void {
    this.activityListeners.push(callback);
  }

  /**
   * Remove activity listener
   */
  removeActivityListener(
    callback: (
      type: string,
      data: {
        requestId?: string;
        url?: string;
        method?: string;
        status?: number;
        type?: string;
        size?: number;
      }
    ) => void
  ): void {
    const index = this.activityListeners.indexOf(callback);
    if (index > -1) {
      this.activityListeners.splice(index, 1);
    }
  }

  /**
   * Check if there's recent activity
   */
  hasActivity(): boolean {
    return this.resources.length > 0;
  }

  /**
   * Notify activity listeners
   */
  private notifyActivity(
    type: string,
    data: {
      requestId?: string;
      url?: string;
      method?: string;
      status?: number;
      type?: string;
      size?: number;
    }
  ): void {
    this.lastActivity = Date.now();
    this.activityListeners.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        logger.warn('Activity listener error:', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }

  /**
   * Get time since last activity
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity;
  }

  /**
   * Reset monitoring state
   */
  reset(): void {
    this.resources = [];
    this.requests.clear();
    this.responses.clear();
    this.lastActivity = Date.now();

    // Reset cross-origin fetcher if available
    if (this.crossOriginFetcher) {
      this.crossOriginFetcher.reset();
    }

    logger.debug('Network monitor reset');
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(idleTime = 2000, maxWait = 30000, verbose = false): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      if (this.getTimeSinceLastActivity() >= idleTime) {
        if (verbose) {
          logger.debug(`Network idle achieved after ${Date.now() - startTime}ms`);
        }
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Get all captured resources
   */
  getResources(): Resource[] {
    return [...this.resources];
  }

  /**
   * Get total transfer size
   */
  getTotalTransferSize(): number {
    return this.resources.reduce((total, resource) => total + resource.transferSize, 0);
  }

  /**
   * Disable network monitoring
   */
  async disable(): Promise<void> {
    if (this.isMonitoring) {
      await this.client.send('Network.disable');
      await this.client.send('Runtime.disable');
      this.isMonitoring = false;
      logger.debug('Network monitoring disabled');
    }
  }
}
