/**
 * Network monitoring module
 * Handles Chrome DevTools Protocol (CDP) network events and data collection
 */

export class NetworkMonitor {
  constructor(client) {
    this.client = client;
    this.resources = [];
    this.totalTransferSize = 0;
    this.pendingRequests = new Set(); // Track requests in progress
    this.lastActivity = Date.now(); // Track last network activity
    this.activityListeners = []; // Callbacks for activity updates
  }

  /**
   * Set up network monitoring listeners
   */
  async setupListeners() {
    // Enable detailed network monitoring and disable cache
    await this.client.send('Network.enable');
    await this.client.send('Network.setCacheDisabled', { cacheDisabled: true });

    // Track request starts
    this.client.on('Network.requestWillBeSent', event => {
      const { requestId, request } = event;

      // Skip data URLs
      if (request.url.startsWith('data:')) return;

      this.pendingRequests.add(requestId);
      this.lastActivity = Date.now();
      this.notifyActivity('request_started', { requestId, url: request.url });
    });

    // Track responses with headers and metadata
    this.client.on('Network.responseReceived', event => {
      const { requestId, response, type } = event;

      // Skip data URLs
      if (response.url.startsWith('data:')) return;

      this.lastActivity = Date.now();
      this.notifyActivity('response_received', {
        requestId,
        url: response.url
      });

      // Create resource entry
      this.resources.push({
        requestId,
        url: response.url,
        contentType: response.mimeType || response.headers['content-type'] || '',
        resourceType: type,
        status: response.status,
        transferSize: 0, // Will be updated in loadingFinished
        headers: response.headers
      });
    });

    // Track actual transfer size when loading completes
    this.client.on('Network.loadingFinished', event => {
      const { requestId, encodedDataLength } = event;
      const resource = this.resources.find(r => r.requestId === requestId);

      if (resource) {
        // encodedDataLength is the actual bytes transferred over the wire
        resource.transferSize = encodedDataLength;
        this.totalTransferSize += encodedDataLength;
      }

      this.pendingRequests.delete(requestId);
      this.lastActivity = Date.now();
      this.notifyActivity('request_finished', {
        requestId,
        transferSize: encodedDataLength
      });
    });

    // Track failed requests
    this.client.on('Network.loadingFailed', event => {
      const { requestId } = event;
      this.pendingRequests.delete(requestId);
      this.lastActivity = Date.now();
      this.notifyActivity('request_failed', { requestId });
    });
  }

  /**
   * Get all collected resources
   */
  getResources() {
    return this.resources;
  }

  /**
   * Get total transfer size
   */
  getTotalTransferSize() {
    return this.totalTransferSize;
  }

  /**
   * Clear collected data
   */
  clear() {
    this.resources = [];
    this.totalTransferSize = 0;
    this.pendingRequests.clear();
    this.lastActivity = Date.now();
  }

  /**
   * Check if there are any pending network requests
   */
  hasPendingRequests() {
    return this.pendingRequests.size > 0;
  }

  /**
   * Get the time since last network activity
   */
  getTimeSinceLastActivity() {
    return Date.now() - this.lastActivity;
  }

  /**
   * Get count of pending requests
   */
  getPendingRequestCount() {
    return this.pendingRequests.size;
  }

  /**
   * Add listener for network activity events
   */
  onActivity(callback) {
    this.activityListeners.push(callback);
  }

  /**
   * Remove activity listener
   */
  removeActivityListener(callback) {
    const index = this.activityListeners.indexOf(callback);
    if (index > -1) {
      this.activityListeners.splice(index, 1);
    }
  }

  /**
   * Notify all activity listeners
   */
  notifyActivity(type, data) {
    this.activityListeners.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.warn('Activity listener error:', error);
      }
    });
  }

  /**
   * Wait for network to become idle (no pending requests and no activity for specified time)
   * @param {number} idleTime - Time in ms to wait for no activity (default: 2000)
   * @param {number} maxWait - Maximum time to wait in ms (default: 30000)
   * @param {boolean} verbose - Whether to log detailed progress (default: false)
   */
  async waitForNetworkIdle(idleTime = 2000, maxWait = 30000, verbose = false) {
    const startTime = Date.now();

    if (verbose) {
      console.log(`🌐 Waiting for network idle (${idleTime}ms quiet, max ${maxWait}ms)`);
    }

    return new Promise(resolve => {
      const checkIdle = () => {
        const elapsed = Date.now() - startTime;
        const timeSinceActivity = this.getTimeSinceLastActivity();
        const pendingCount = this.getPendingRequestCount();

        if (verbose) {
          console.log(
            `   Network status: ${pendingCount} pending, ${timeSinceActivity}ms since activity`
          );
        }

        // Check if we've exceeded max wait time
        if (elapsed >= maxWait) {
          if (verbose) {
            console.log(`   ⏰ Max wait time reached (${maxWait}ms), stopping wait`);
          }
          resolve();
          return;
        }

        // Check if network is idle
        if (pendingCount === 0 && timeSinceActivity >= idleTime) {
          if (verbose) {
            console.log('   ✅ Network appears idle, continuing');
          }
          resolve();
          return;
        }

        // Continue checking
        setTimeout(checkIdle, 500);
      };

      checkIdle();
    });
  }
}
