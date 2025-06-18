/**
 * API routes for naubion
 */

import express from 'express';
import { AnalysisController } from './controllers/analysis-controller.js';
import { NewsletterController } from './controllers/newsletter-controller.js';
import { pageAnalysisService } from '../di/index.js';

const router = express.Router();
const analysisController = new AnalysisController(pageAnalysisService);
const newsletterController = new NewsletterController();

/**
 * POST /api/analyze
 * Start analysis and return immediate response with estimation
 */
router.post('/analyze', analysisController.analyze);

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

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
router.post('/newsletter/subscribe', newsletterController.subscribe);

export default router;
