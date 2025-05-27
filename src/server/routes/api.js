/**
 * API routes for the Green Web Compass
 * Improved with proper validation, error handling, and logging
 */

import express from 'express';
import { analyzeUrl } from '../services/analysis.js';
import {
  asyncHandler,
  validateUrl,
  validateAnalysisOptions,
  AnalysisError
} from '../../utils/errors.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze a URL for page weight and resource breakdown
 */
router.post(
  '/analyze',
  asyncHandler(async (req, res) => {
    const { url, interactionLevel = 'default', deviceType = 'desktop' } = req.body;

    // Validate inputs
    validateUrl(url);
    validateAnalysisOptions({ interactionLevel, deviceType });

    logger.step('Starting analysis', {
      url,
      interactionLevel,
      deviceType,
      userAgent: req.get('User-Agent')
    });

    try {
      const result = await analyzeUrl(url, { interactionLevel, deviceType });

      logger.success('Analysis completed', {
        url,
        totalSize: result.totalTransferSize,
        resourceCount: result.resourceCount
      });

      res.json(result);
    } catch (error) {
      logger.error('Analysis failed', {
        url,
        error: error.message,
        stack: error.stack
      });

      throw new AnalysisError(`Failed to analyze URL: ${error.message}`, url);
    }
  })
);

/**
 * GET /api/health
 * API health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'green-web-compass-api',
    timestamp: new Date().toISOString()
  });
});

export { router as default };
