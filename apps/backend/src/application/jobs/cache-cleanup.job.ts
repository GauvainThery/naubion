/**
 * Cache Cleanup Job
 * Scheduled job to clean up expired cache entries
 */

import { AnalysisCacheService } from '../services/analysis-cache-service.js';
import logger from '../../shared/logger.js';

export class CacheCleanupJob {
  private cacheService: AnalysisCacheService;

  constructor() {
    this.cacheService = new AnalysisCacheService();
  }

  /**
   * Run the cache cleanup job
   */
  async run(): Promise<void> {
    logger.info('Starting cache cleanup job');

    try {
      // Clean up entries that have explicitly expired
      const expiredCount = await this.cacheService.cleanupExpiredCache();

      // Also clean up very old entries (older than 30 days) as a safety net
      const oldCount = await this.cacheService.cleanupOldCache(30);

      logger.info('Cache cleanup job completed', {
        expiredEntriesRemoved: expiredCount,
        oldEntriesRemoved: oldCount,
        totalRemoved: expiredCount + oldCount
      });
    } catch (error) {
      logger.error('Cache cleanup job failed', { error });
      throw error;
    }
  }
}
