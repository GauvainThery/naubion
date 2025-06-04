/**
 * API routes for the Green Web Compass
 */

import express from 'express';
import { AnalysisController } from './controllers/analysis-controller.js';
import { websiteAnalysisService } from '../di/index.js';

const router = express.Router();
const analysisController = new AnalysisController(websiteAnalysisService);

/**
 * POST /api/analyze
 * Analyze a URL for page weight and resource breakdown
 */
router.post('/analyze', analysisController.analyze);

/**
 * GET /api/health
 * API health check endpoint
 */
router.get('/health', analysisController.healthCheck);

export default router;
