/**
 * Admin controller for job management and cache control
 */

import { Request, Response } from 'express';
import { CacheCleanupJob } from '../../../application/jobs/cache-cleanup.job.js';
import { AnalysisCacheService } from '../../../application/services/analysis-cache-service.js';
import logger from '../../../shared/logger.js';

export class AdminController {
  private cacheService: AnalysisCacheService;

  constructor() {
    this.cacheService = new AnalysisCacheService();
  }

  /**
   * Run cache cleanup job manually
   */
  async runCacheCleanup(req: Request, res: Response): Promise<void> {
    try {
      const cleanupJob = new CacheCleanupJob();

      logger.info('Manual cache cleanup requested', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      const startTime = Date.now();
      await cleanupJob.run();
      const duration = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          message: 'Cache cleanup completed successfully',
          duration,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Manual cache cleanup failed', { error });
      res.status(500).json({
        success: false,
        data: {
          message: 'Cache cleanup failed'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.cacheService.getCacheStats();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to get cache stats', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cache statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clean up expired cache entries only
   */
  async cleanupExpiredCache(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const expiredCount = await this.cacheService.cleanupExpiredCache();
      const duration = Date.now() - startTime;

      logger.info('Manual expired cache cleanup completed', {
        expiredCount,
        duration,
        ip: req.ip
      });

      res.json({
        success: true,
        data: {
          message: `Cleaned up ${expiredCount} expired cache entries`,
          expiredCount,
          duration,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Manual expired cache cleanup failed', { error });
      res.status(500).json({
        success: false,
        data: {
          message: 'Expired cache cleanup failed'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clean up old cache entries
   */
  async cleanupOldCache(req: Request, res: Response): Promise<void> {
    try {
      const { olderThanDays = 30 } = req.body;

      // Validate input
      if (typeof olderThanDays !== 'number' || olderThanDays < 1) {
        res.status(400).json({
          success: false,
          data: {
            message: 'olderThanDays must be a positive number'
          }
        });
        return;
      }

      const startTime = Date.now();
      const oldCount = await this.cacheService.cleanupOldCache(olderThanDays);
      const duration = Date.now() - startTime;

      logger.info('Manual old cache cleanup completed', {
        oldCount,
        olderThanDays,
        duration,
        ip: req.ip
      });

      res.json({
        success: true,
        data: {
          message: `Cleaned up ${oldCount} old cache entries`,
          oldCount,
          olderThanDays,
          duration,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Manual old cache cleanup failed', { error });
      res.status(500).json({
        success: false,
        message: 'Old cache cleanup failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Health check for admin endpoints
   */
  healthCheck(req: Request, res: Response): void {
    res.json({
      success: true,
      message: 'Admin endpoints are healthy',
      cacheEnabled: this.cacheService.isCacheEnabled(),
      cacheTTL: this.cacheService.getCacheTTL(),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get admin dashboard data
   */
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.cacheService.getCacheStats();

      res.json({
        success: true,
        data: {
          cache: stats,
          system: {
            nodeVersion: process.version,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            platform: process.platform
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get admin dashboard data', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
