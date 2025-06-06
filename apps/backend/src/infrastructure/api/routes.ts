/**
 * API routes for the Green Web Compass
 */

import express from 'express';
import { AnalysisController } from './controllers/analysis-controller.js';
import { websiteAnalysisService, fullWebsiteAnalysisService } from '../di/index.js';

const router = express.Router();
const analysisController = new AnalysisController(
  websiteAnalysisService,
  fullWebsiteAnalysisService
);

/**
 * POST /api/analyze
 * Start analysis and return immediate response with estimation
 */
router.post('/analyze', analysisController.analyze);

/**
 * POST /api/analyze-website
 * Start website analysis and return immediate response with estimation
 */
router.post('/analyze-website', analysisController.analyzeWebsite);

/**
 * GET /api/analysis/:analysisId/progress
 * Server-Sent Events endpoint for real-time progress updates
 */
router.get('/analysis/:analysisId/progress', analysisController.progress);

/**
 * GET /api/analysis/:analysisId/result
 * Get final analysis results
 */
router.get('/analysis/:analysisId/result', analysisController.result);

/**
 * GET /api/health
 * API health check endpoint
 */
router.get('/health', analysisController.healthCheck);

export default router;
