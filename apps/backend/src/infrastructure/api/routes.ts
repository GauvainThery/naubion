/**
 * API routes for naubion
 */

import express from 'express';
import {
  co2eBytesConversionService,
  greenHostingService,
  humanReadableImpactService,
  pageAnalysisService
} from '../di/index.js';
import { AnalysisController } from './controllers/analysis-controller.js';
import { Co2eBytesConversionController } from './controllers/co2e-bytes-conversion-controller.js';
import { GreenHostingController } from './controllers/green-hosting-controller.js';
import { HumanReadableImpactController } from './controllers/human-readable-impact-controller.js';
import { NewsletterController } from './controllers/newsletter-controller.js';

const router = express.Router();
const analysisController = new AnalysisController(pageAnalysisService);
const newsletterController = new NewsletterController();
const greenHostingController = new GreenHostingController(greenHostingService);
const co2eBytesConversionController = new Co2eBytesConversionController(co2eBytesConversionService);
const humanReadableImpactController = new HumanReadableImpactController(humanReadableImpactService);

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
 * GET /api/green-hosting/:url
 * Assess if a url is green hosted
 */
router.get('/green-hosting/:url', greenHostingController.assessGreenHosting);

/**
 * GET /api/co2e-bytes
 * Convert bytes to CO2e considering if server is green hosted
 */
router.get('/co2e-bytes/:bytes?:isGreenHosted', co2eBytesConversionController.convertBytesIntoCo2e);

/**
 * GET /api/human-readable-impact/:gCo2e
 * Convert CO2e emissions to human-readable impact
 */
router.get(
  '/human-readable-impact/:gCo2e',
  humanReadableImpactController.convertToHumanReadableImpact
);

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
