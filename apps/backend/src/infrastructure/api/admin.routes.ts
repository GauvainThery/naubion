/**
 * Admin routes for job management and cache control
 */

import { Router } from 'express';
import { requireAdminAuth, createAdminSession } from './middleware/admin-auth.middleware.js';
import { AdminController } from './controllers/admin-controller.js';

const router = Router();
const adminController = new AdminController();

/**
 * Admin login endpoint
 * POST /admin/login
 */
router.post('/login', createAdminSession);

/**
 * Run cache cleanup job manually
 * POST /admin/jobs/cache-cleanup
 */
router.post(
  '/jobs/cache-cleanup',
  requireAdminAuth,
  adminController.runCacheCleanup.bind(adminController)
);

/**
 * Get cache statistics
 * GET /admin/cache/stats
 */
router.get('/cache/stats', requireAdminAuth, adminController.getCacheStats.bind(adminController));

/**
 * Clean up expired cache entries only
 * POST /admin/cache/cleanup-expired
 */
router.post(
  '/cache/cleanup-expired',
  requireAdminAuth,
  adminController.cleanupExpiredCache.bind(adminController)
);

/**
 * Clean up old cache entries
 * POST /admin/cache/cleanup-old
 */
router.post(
  '/cache/cleanup-old',
  requireAdminAuth,
  adminController.cleanupOldCache.bind(adminController)
);

/**
 * Health check for admin endpoints
 * GET /admin/health
 */
router.get('/health', requireAdminAuth, adminController.healthCheck.bind(adminController));

/**
 * Get admin dashboard data
 * GET /admin/dashboard
 */
router.get('/dashboard', requireAdminAuth, adminController.getDashboardData.bind(adminController));

export default router;
