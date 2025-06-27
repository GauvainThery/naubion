/**
 * Repository for PageAnalysis entities
 * Handles database operations for analysis results
 */

import { Repository } from 'typeorm';
import crypto from 'crypto';
import { PageAnalysisOptions, PageAnalysisResult } from '../../../domain/models/page-analysis.js';
import { AppDataSource } from '../data-source.js';
import { PageAnalysisEntity } from '../entities/page-analysis.entity.js';
import logger from '../../../shared/logger.js';

export class PageAnalysisRepository {
  private repository: Repository<PageAnalysisEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(PageAnalysisEntity);
  }

  /**
   * Generate a hash for analysis options to use as cache key
   */
  private generateOptionsHash(url: string, options: PageAnalysisOptions): string {
    const normalizedOptions = {
      interactionLevel: options.interactionLevel,
      deviceType: options.deviceType,
      maxInteractions: options.maxInteractions,
      maxScrollSteps: options.maxScrollSteps
    };

    const hashInput = JSON.stringify({ url, options: normalizedOptions });
    return crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 16);
  }

  /**
   * Find cached analysis result
   */
  async findCachedAnalysis(
    url: string,
    options: PageAnalysisOptions,
    ttlHours: number = 24 * 10
  ): Promise<PageAnalysisResult | null> {
    try {
      const optionsHash = this.generateOptionsHash(url, options);

      const entity = await this.repository.findOne({
        where: {
          url,
          optionsHash
        },
        order: {
          createdAt: 'DESC'
        }
      });

      if (!entity) {
        logger.debug('No cached analysis found', { url, optionsHash });
        return null;
      }

      // Check if the entry has expired using explicit expiration date
      if (entity.isExpired()) {
        logger.debug('Cached analysis expired (explicit expiration)', {
          url,
          optionsHash,
          expiresAt: entity.expiresAt.toISOString(),
          now: new Date().toISOString()
        });
        return null;
      }

      // Optional: Also check TTL for backwards compatibility
      if (!entity.isFresh(ttlHours)) {
        logger.debug('Cached analysis expired (TTL check)', {
          url,
          optionsHash,
          age: Date.now() - entity.createdAt.getTime()
        });
        return null;
      }

      logger.info('Found fresh cached analysis', {
        url,
        optionsHash,
        cacheAge: Date.now() - entity.createdAt.getTime()
      });

      return entity.toDomainModel();
    } catch (error) {
      logger.error('Error finding cached analysis', { error, url });
      return null;
    }
  }

  /**
   * Save analysis result to cache
   */
  async saveAnalysis(result: PageAnalysisResult, ttlHours: number = 24 * 10): Promise<void> {
    try {
      const optionsHash = this.generateOptionsHash(result.url, result.options);
      const entity = PageAnalysisEntity.fromDomainModel(result, optionsHash, ttlHours);

      await this.repository.save(entity);

      logger.info('Analysis result saved to cache', {
        url: result.url,
        optionsHash,
        resourceCount: result.resources.resourceCount,
        totalSize: result.resources.totalTransferSize,
        expiresAt: entity.expiresAt.toISOString()
      });
    } catch (error) {
      logger.error('Error saving analysis to cache', { error, url: result.url });
      // Don't throw - caching failures shouldn't break the analysis flow
    }
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStats(): Promise<{
    totalAnalyses: number;
    uniqueUrls: number;
  }> {
    try {
      const [totalAnalyses, uniqueUrls] = await Promise.all([
        this.repository.count(),
        this.repository
          .createQueryBuilder('analysis')
          .select('COUNT(DISTINCT url)', 'count')
          .getRawOne()
      ]);

      return {
        totalAnalyses,
        uniqueUrls: uniqueUrls.count || 0 // Replace with actual unique URL count if implemented
      };
    } catch (error) {
      logger.error('Error getting analysis stats', { error });
      return {
        totalAnalyses: 0,
        uniqueUrls: 0
      };
    }
  }

  /**
   * Clean up old analysis results
   */
  async cleanupOldAnalyses(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.repository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .execute();

      const deletedCount = result.affected || 0;

      if (deletedCount > 0) {
        logger.info('Cleaned up old analyses', {
          deletedCount,
          olderThanDays,
          cutoffDate: cutoffDate.toISOString()
        });
      }

      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up old analyses', { error, olderThanDays });
      return 0;
    }
  }

  /**
   * Find recent analyses for a URL
   */
  async findRecentAnalyses(url: string, limit: number = 10): Promise<PageAnalysisResult[]> {
    try {
      const entities = await this.repository.find({
        where: { url },
        order: { createdAt: 'DESC' },
        take: limit
      });

      return entities.map(entity => entity.toDomainModel());
    } catch (error) {
      logger.error('Error finding recent analyses', { error, url });
      return [];
    }
  }

  /**
   * Clean up analyses that have exceeded their explicit expiration date
   */
  async cleanupExpiredCache(): Promise<number> {
    try {
      const now = new Date();

      const result = await this.repository
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now })
        .execute();

      const deletedCount = result.affected || 0;

      if (deletedCount > 0) {
        logger.info('Cleaned up expired analyses', {
          deletedCount,
          expiredBefore: now.toISOString()
        });
      }

      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired analyses', { error });
      return 0;
    }
  }
}
