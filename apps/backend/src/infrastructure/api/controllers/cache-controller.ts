/**
 * Cache management API controller
 * Provides endpoints for cache statistics and management
 */

import { Request, Response } from 'express';
import { pageAnalysisService } from '../../../infrastructure/di/index.js';
import { asyncHandler } from '../../../shared/errors.js';
import logger from '../../../shared/logger.js';

/**
 * Get cache statistics
 */
export const getCacheStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await pageAnalysisService.getCacheStats();

  logger.info('Cache statistics requested', stats);

  res.json({
    success: true,
    data: stats
  });
});

/**
 * Check if a URL has cached analysis
 */
export const checkCacheStatus = asyncHandler(async (req: Request, res: Response) => {
  const { url, interactionLevel = 'default', deviceType = 'desktop' } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'URL parameter is required'
    });
  }

  const hasCached = await pageAnalysisService.hasCachedAnalysis(url, {
    interactionLevel: interactionLevel as 'minimal' | 'default' | 'thorough',
    deviceType: deviceType as 'desktop' | 'mobile'
  });

  res.json({
    success: true,
    data: {
      url,
      hasCachedResult: hasCached,
      cacheEnabled: pageAnalysisService.isCacheEnabled(),
      cacheTTL: pageAnalysisService.getCacheTTL()
    }
  });
});

/**
 * Get recent analyses for a URL
 */
export const getRecentAnalyses = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL parameter is required'
    });
  }

  const recentAnalyses = await pageAnalysisService.getRecentAnalyses(url, limit);

  res.json({
    success: true,
    data: {
      url,
      analyses: recentAnalyses,
      count: recentAnalyses.length
    }
  });
});

/**
 * Clean up old cached analyses
 */
export const cleanupCache = asyncHandler(async (req: Request, res: Response) => {
  const olderThanDays = parseInt(req.body.olderThanDays) || 30;

  if (olderThanDays < 1 || olderThanDays > 365) {
    return res.status(400).json({
      success: false,
      error: 'olderThanDays must be between 1 and 365'
    });
  }

  const deletedCount = await pageAnalysisService.cleanupCache(olderThanDays);

  logger.info('Cache cleanup completed', { deletedCount, olderThanDays });

  res.json({
    success: true,
    data: {
      deletedCount,
      olderThanDays,
      message: `Cleaned up ${deletedCount} old analysis results`
    }
  });
});
